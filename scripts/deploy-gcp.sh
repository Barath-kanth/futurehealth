#!/usr/bin/env bash
# Budget deploy: Cloud Run + Firestore + BigQuery + Scheduler
# Project: futurehealth-514508 (override with GCP_PROJECT)
set -euo pipefail

PROJECT="${GCP_PROJECT:-futurehealth-514508}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="${CLOUD_RUN_SERVICE:-seedshield-agents}"
DATASET="${BQ_DATASET:-seedshield_events}"
SECRET="${AGENT_SCHEDULER_SECRET:-seedshield-scheduler-demo}"

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
  --cpu=2 \
  --min-instances=1 \
  --max-instances=3 \
  --timeout=300 \
  --cpu-boost \
  --no-cpu-throttling \
  --update-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT,BQ_DATASET=$DATASET,FIRESTORE_COLLECTION=seedshield,AGENT_SCHEDULER_SECRET=$SECRET,AGENT_PERSIST=gcp,VERTEX_MODEL=gemini-2.0-flash-001${OPENWEATHER_API_KEY:+,OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY}" \
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
echo "  min-instances=1 + 2Gi + always-on CPU (avoids OOM / 10s stalls). Set min=0 + cpu-throttling after judging to save budget."
