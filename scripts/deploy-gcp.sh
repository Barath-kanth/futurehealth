#!/usr/bin/env bash
# Budget deploy: Cloud Run + Firestore + BigQuery + Scheduler
# Project: futurehealth-514508 (override with GCP_PROJECT)
set -euo pipefail

PROJECT="${GCP_PROJECT:-futurehealth-514508}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="${CLOUD_RUN_SERVICE:-seedshield-agents}"
DATASET="${BQ_DATASET:-seedshield_events}"
SECRET="${AGENT_SCHEDULER_SECRET:-seedshield-scheduler-demo}"
# Gemini (billed per token) is off by default; turn on with GEMINI_ENABLED=true.
# AGENT_PERSIST=gcp writes to Firestore + BigQuery; use "memory" to skip storage.
# OPENWEATHER_API_KEY is only sent when set, so an existing value on Cloud Run is kept.
GEMINI_ENABLED="${GEMINI_ENABLED:-false}"
AGENT_PERSIST="${AGENT_PERSIST:-gcp}"

echo "==> Project $PROJECT / region $REGION"

gcloud config set project "$PROJECT"

echo "==> Enable APIs"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  cloudscheduler.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  --quiet

echo "==> Firestore (native) — ignore if already exists"
gcloud firestore databases create --location="$REGION" --quiet 2>/dev/null || true

echo "==> BigQuery dataset"
bq --location=US mk -d --description "SeedShield agent events" "$PROJECT:$DATASET" 2>/dev/null || true

echo "==> Build & deploy Cloud Run (source deploy — no local Docker required)"
gcloud run deploy "$SERVICE" \
  --source=. \
  --region="$REGION" \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=1 \
  --timeout=300 \
  --cpu-boost \
  --update-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT,BQ_DATASET=$DATASET,FIRESTORE_COLLECTION=seedshield,AGENT_SCHEDULER_SECRET=$SECRET,AGENT_PERSIST=$AGENT_PERSIST,GEMINI_ENABLED=$GEMINI_ENABLED,VERTEX_MODEL=gemini-3.8-flash,GOOGLE_CLOUD_LOCATION=global${OPENWEATHER_API_KEY:+,OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY}" \
  --quiet

URL="$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')"
echo "==> Service URL: $URL"

echo "==> Cloud Scheduler every 6 hours"
JOB="seedshield-agent-cycle"
gcloud scheduler jobs delete "$JOB" --location="$REGION" --quiet 2>/dev/null || true
gcloud scheduler jobs create http "$JOB" \
  --location="$REGION" \
  --schedule="0 */6 * * *" \
  --uri="$URL/api/agents/scheduled" \
  --http-method=POST \
  --headers="Content-Type=application/json,X-Agent-Secret=$SECRET" \
  --message-body='{"memberId":"member-scheduler"}' \
  --quiet

echo ""
echo "Done."
echo "  Cloud Run:  $URL"
echo "  Agents UI:  $URL/agents"
echo "  Scheduler:  $JOB (every 6h)"
echo "  Set local AGENT_PLATFORM_URL=$URL if Next should proxy to Cloud Run"
echo "  min-instances=0, max 1 instance, GEMINI_ENABLED=$GEMINI_ENABLED, AGENT_PERSIST=$AGENT_PERSIST. Expect a cold start on the first visit."
