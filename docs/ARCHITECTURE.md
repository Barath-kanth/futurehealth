# SeedShield — Architecture (submission slide)

**Product:** SeedShield · Male Vitality & Legacy Guardian  
**Live demo:** https://seedshield-agents-gmv4iqwxgq-uc.a.run.app  
**GCP project:** `futurehealth-514508` · region `us-central1`  
**Principle:** Deterministic **Safe Triage** is the safety floor. Multi-agent early warning **reads** triage and **cannot override** it. Screening ≠ diagnosis.

---

## 1. End-to-end workflow (what the user experiences)

```text
Age gate (18+) → Consent vault → Consented signals
        ↓
   Safe Triage (rules)  →  Next step / Do now / Doctor (opt-in)
        ↓
   Quiet watch (agents) → Alert you → optional book / notify doctor
```

**Start here for judges:** Triage → Vault → Analytics (Reviewer board).

---

## 2. Application architecture

| Layer | What we use | Role |
| --- | --- | --- |
| UI | Next.js 16 App Router, React 19, Tailwind, Zustand | Patient screens + reviewer board |
| Safety core | `risk-engine.ts` + `consent-filter.ts` | Auditable Safe Triage (6 pathways) |
| Early warning | 7 agents in `src/lib/agents/*` | Setup→Radar→Ingest→Monitor→Investigate→Notify→Care |
| Explain / foresight | Vertex Gemini (optional) | Reword rules only; investigate enrichment; `/studio` |
| Synthetic fairness | ~500 author-built cohort | Funnel / fairness demo — not real PHI |
| APIs | `/api/agents/cycle`, `/api/agents/scheduled`, `/api/explain`, … | Cycle + scheduler + helpers |

### Agent responsibilities (Amri-style EWS)

| Agent | Does | Cannot |
| --- | --- | --- |
| Setup | Thresholds, topics, member id | Change triage |
| Radar | World research (Search / curated stubs) | Diagnose |
| Ingest | Live streams + documents + social/env | Bypass consent |
| Monitor | Personal limit breaches | Override triage |
| Investigate | Evidence narrative (Gemini optional) | Change locked tier |
| Notify | In-app / simulated channels | Contact doctor without opt-in |
| Care | Doctor bridge + booking **only if user opts in** | Auto-book |

---

## 3. GCP architecture (what runs in the cloud)

```text
                    ┌─────────────────────────┐
                    │     Cloud Scheduler     │
                    │   every 6h → POST       │
                    │ /api/agents/scheduled   │
                    └───────────┬─────────────┘
                                │
┌──────────────┐     ┌──────────▼──────────┐     ┌────────────────┐
│  Browser UI  │────▶│   Cloud Run         │────▶│   Firestore    │
│  Next.js app │◀────│ seedshield-agents   │     │ cycles/alerts/ │
└──────────────┘     │ Next.js + APIs      │     │ bookings       │
                     └──────────┬──────────┘     └────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
       ┌────────────┐   ┌────────────┐   ┌────────────────┐
       │  BigQuery  │   │ Vertex AI  │   │ Google Search  │
       │ agent_events│   │ Gemini     │   │ (Radar / stubs)│
       └────────────┘   └────────────┘   └────────────────┘
```

| GCP service | SeedShield use | Budget notes |
| --- | --- | --- |
| **Cloud Run** | Hosts full Next.js app + agent APIs | `2Gi` RAM, `2` CPU, min instances `1` for demo stability |
| **Cloud Scheduler** | Triggers agent cycle every 6 hours | Secret header `X-Agent-Secret` |
| **Firestore** | Persists cycles, findings, alerts, bookings | Prefer over always-on Cloud SQL |
| **BigQuery** | Dataset `seedshield_events` · table `agent_events` | Analytics rows for reviewers |
| **Vertex AI / Gemini** | Optional investigate enrich + explain | Fails closed to rules / stubs |
| **IAM** | Cloud Run SA → Datastore, BQ, AI Platform | Least privilege for demo |

**Not used (on purpose for budget):** always-on Cloud SQL. Firestore covers findings/events/alerts.

---

## 4. Data & trust flow

1. User consents in **Vault** (wearable, environment, clinical, self-report, …).  
2. `applyConsents()` strips non-consented fields **before** triage.  
3. Safe Triage emits pathway + red flags (human review gate for specialty/fertility).  
4. Quiet watch agents run on schedule or on page open; doctor notify / booking need **explicit opt-in**.  
5. Persist cycle summary to Firestore + BigQuery when `AGENT_PERSIST=gcp`.  
6. No real patient PHI; demo persona **Omar, 34** + synthetic cohort for metrics.

---

## 5. Safety locks (judge-checkable)

- Screening ≠ diagnosis; no medication start/stop advice.  
- Agents **cannot** change locked triage tier (safety test included).  
- AI screening guide (Gemini; off in the public demo via `GEMINI_ENABLED=false`, so the rule-based replies run): fixed rules answer diagnosis Q, meds Q, sudden pain → urgent and self-harm → crisis redirect before any model runs; Gemini answers everything else from the consent-filtered screening file; an output guard drops diagnosis, dose and outcome claims and falls back to rules.  
- `npm run test:triage` → 23/23.  
- `/boundaries` = what we don’t do.

---

## 6. Copy-paste caption for PPT slide 4

> SeedShield runs as a Next.js app on **Cloud Run** (project `futurehealth-514508`). Consented signals feed a **deterministic Safe Triage** safety floor. An Amri-style **7-agent** early-warning loop (Scheduler → Radar/Ingest/Monitor/Investigate/Notify/Care) can alert and offer booking but **cannot override triage**. Findings persist to **Firestore** + **BigQuery**; Gemini/Search enrich when available and fail closed to rules/stubs.
