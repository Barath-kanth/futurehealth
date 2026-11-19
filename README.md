# SeedShield

**Male Vitality & Legacy Guardian** — culturally-anchored, privacy-first, consent-based early-check prototype for the Future Health Digital Innovation Challenge (Abu Dhabi).

Not a fertility app. Not an infertility tracker. Not a sperm-optimization coach.  
**Screening ≠ diagnosis.**

## What this prototype demonstrates

1. **Safe Triage centerpiece** — insufficient-info → self-care → primary care → andrology/urology → fertility (clinician-gated) → urgent, with red flags, human-review gates, and demo override  
2. **Earlier explainable risk identification** from consented wearables, environment, work, and optional simulated home kits  
3. **Gulf cultural trust** — bilingual EN/AR, stewardship / direct / clinical tone, zero family-choice assumptions  
4. **Privacy vault** — granular revocable consent; **doctor alerts are opt-in**  
5. **Illustrative MVI** — bands labeled non-validated; prefer signals + triage over the single score  
6. **Synthetic fairness layer** — ~500 men → funnel + fairness + challenge value metrics  
7. **GCP agent platform** — 7 linked agents on Cloud Run + Firestore + BigQuery + Scheduler + Search + Gemini (`/agents`) + Dynamic Agent (`/studio`)  
8. **Submission pack** — `TECH.md`, `docs/SUBMISSION_HACK2SKILL.md`, clinician email one-pager, `/boundaries`  
9. **Honesty labels** — simulated doctor, devices, kits; alcohol/lung demoted out of reproductive focus  
10. **Genomic readiness** — consent-gated placeholder aligned with Abu Dhabi genomic care direction  

Full technical brief: [`TECH.md`](./TECH.md) (also served at `/TECH.md`).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Live agent platform (GCP)

- **Cloud Run:** https://seedshield-agents-gmv4iqwxgq-uc.a.run.app  
- **Agents UI:** https://seedshield-agents-gmv4iqwxgq-uc.a.run.app/agents  
- **Deploy / update:** `npm run deploy:gcp` (project `futurehealth-514508`)  
- Flow: Setup → Radar → Ingest → Monitor → Investigate → Notify → Care  
- Persist: Firestore + BigQuery (`seedshield_events`); Scheduler every 6h  

Copy `.env.example` → `.env.local`. Set `AGENT_PLATFORM_URL` to the Cloud Run URL to proxy local Next through the live service.

### Demo path for judges

1. Age gate **18+** → one personal file  
2. **`/triage`** — Safe Triage + book / teleconsult / text-only  
3. `/agents` — run full multi-agent cycle (ingest → alert → book)  
4. `/vault` — consents, cultural tone, doctor alert opt-in, genomic **placeholder**  
5. `/analytics` — closed loop, clinician queue, fairness, safety tests  
6. Explain: “Simulate API fail” still returns rule-engine text only  
7. Header **Reset** clears demo state  
8. `npm run test:triage` · see [`TECH.md`](./TECH.md)  

## Vertex AI Gemini (required; off in the public demo for cost)

Copy `.env.example` → `.env.local` and set:

- `GOOGLE_CLOUD_PROJECT=futurehealth-514508`
- `GOOGLE_APPLICATION_CREDENTIALS`
- optional `GOOGLE_CLOUD_LOCATION`, `VERTEX_MODEL`, `AGENT_PERSIST=gcp`

Without credentials the explain API still works via `local-fallback`; agents persist to memory.

## Architecture

```
src/lib/risk-engine.ts           Signals + Safe Triage rules
src/lib/agents/*                 7-agent orchestrator + Firestore/BQ persist
src/lib/synthetic-population.ts  ~500 men for fairness / funnel
src/lib/gcp/vertex.ts            Vertex AI Gemini + fallback
src/app/agents                   Agent platform UI (Run cycle)
src/app/api/agents/cycle         Cycle API (also on Cloud Run)
src/app/api/agents/scheduled     Cloud Scheduler target
src/app/triage                   Product centerpiece
TECH.md                          Assumptions, limitations, validation plan
scripts/deploy-gcp.sh            Budget Cloud Run + Scheduler deploy
```

## Challenge alignment

| Desired outcome | Prototype surface |
| --- | --- |
| Safe triage & referral | `/triage` six pathways + red flags + override |
| Earlier risk identification | Risk engine + personal findings |
| Culturally trusted experience | AR/EN + tone picker + stewardship copy |
| Lower-friction assessment | Age gate → triage “what happens next” |
| Privacy by design | `/vault` consents + opt-in sharing |
| Demonstrable value + fairness | `/analytics` synthetic cohort metrics |
| Technical documentation | `TECH.md` |

## Disclaimer

Screening signals only — **not a diagnosis**. Specialty / fertility referral requires human clinical review. The app never advises starting or stopping medication. Simulated integrations are labeled on screen.
