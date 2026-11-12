# SeedShield — Technical documentation

**Male Vitality & Legacy Guardian** · Future Health Digital Innovation Challenge (Abu Dhabi)  
**Status:** Interactive prototype · screening ≠ diagnosis  
**Rules posture:** **Guideline-derived, pending clinical review** (send `docs/CLINICIAN_REVIEW_EMAIL.md` today)

---

## 1. Purpose

Upstream, privacy-first **trusted front door** for male reproductive health screening (adults **18+**). Surfaces consented risk signals, Safe Triage, and an Amri-style multi-agent early-warning system. Does **not** diagnose, prescribe, start/stop medication, or auto-refer to fertility services.

---

## 2. Architecture

| Layer | Implementation |
| --- | --- |
| App | Next.js App Router, React 19, Tailwind 4, Zustand (browser-only) |
| Safe Triage | Deterministic `risk-engine.ts` + consent filter |
| Dynamic sensitivity | `dynamic-sensitivity.ts` |
| Gemini Dynamic Agent | Multi-factor foresight — Gemini-only (`/studio`) |
| **Early Warning (Amri-pattern)** | **7 agents** Setup→Radar→Ingest→Monitor→Investigate→Notify→Care (`/agents`) |
| Explain reword | Vertex paraphrase of rule text only |
| Synthetic cohort | ~500 author-built men for fairness / care loop |

### Amri-aligned agent stack (budget GCP)

| Technology | Responsibility in SeedShield |
| --- | --- |
| Cloud Scheduler | POST `/api/agents/scheduled` every 6h |
| BigQuery | `seedshield_events.agent_events` analytics rows |
| Google Search | Radar live web / Vertex grounding |
| Gemini | Investigate enrichment + `/studio` Dynamic Agent |
| ADK pattern | 7 agents in `src/lib/agents/*` |
| Cloud Run | `seedshield-agents` via `npm run deploy:gcp` |
| Firestore | Findings, alerts, bookings, cycles (budget vs always-on Cloud SQL) |

**Seven linked agents**

1. **Setup** — thresholds, topics, member id  
2. **Radar** — worldwide research (Search)  
3. **Ingest** — realtime streams + documents + social/env fusion  
4. **Monitor** — personal thresholds  
5. **Investigate** — evidence chains (Gemini); does not override Safe Triage  
6. **Notify** — patient / doctor channels  
7. **Care** — doctor bridge + consult booking  

Deploy: `npm run deploy:gcp` (project `futurehealth-514508`). Local fallback persists to memory when GCP creds are absent.

---

## 3. Guideline mapping (named — judge-checkable)

| Prototype rule | Named source | Version / locus | Ours vs guideline |
| --- | --- | --- | --- |
| Semen concentration / motility / morphology as screening cues | **WHO Laboratory Manual for the Examination and Processing of Human Semen** | **6th edition, 2021** | Uses WHO-aligned “outside common ranges” language; **not** a lab report substitute |
| Evaluation themes: history, semen, hormones, anatomy → specialty path | **AUA/ASRM Guideline: Diagnosis and Treatment of Infertility in Men** | **2020/2021** (AUA guideline page) | Pathway labels + human-review gate only; **no** treatment algorithm |
| Sudden testicular pain → urgent | Acute scrotum / torsion teaching (e.g. **EAU** acute scrotum pathways; emergency medicine standard of care) | Clinical teaching (not a single SeedShield cut-point) | Binary intake flag → urgent; app **cannot** exclude torsion |
| Metabolic BMI / glucose → primary care | Routine primary-care metabolic screening practice (e.g. obesity / dysglycemia referral norms) | General practice | **Our simplification** into triage tiers |
| Infectious / STI history → primary (escalate if systemic) | Sexual-health screening norms in primary care | General | **Placeholder cues**; not STI diagnosis |
| Cryptorchidism / orchitis / trauma / varicocele history cues | AUA/ASRM evaluation history elements | 2020/2021 themes | **Placeholder** anatomical flags |
| SDF elevated → andrology cue | Andrology / ASRM discussions on SDF as adjunct | Literature consensus varies | **Our simplification** (threshold 25% illustrative) |
| Exogenous androgen / TRT on file → clinician discussion | Established reproductive endocrinology (exogenous T suppresses spermatogenesis) | Textbook / guideline knowledge | Flag only; **never** start/stop advice |
| MVI bands 60 / 75 | — | — | **SeedShield prototype only — not guideline-derived** |
| Consent strips non-consented flags | Responsible AI / data-minimisation principle | Challenge governance | **Our privacy rule** |

---

## 4. Safe Triage + consent

Consents applied via `applyConsents()` **before** signal generation. Non-consented red flags are ignored (covered in safety tests).

Outcomes: insufficient_info · self_care · primary_care · andrology_urology · fertility_services (gated) · urgent.

---

## 5. Triage safety tests

Run: `npm run test:triage` · UI: `/analytics` · API: `/api/triage-safety`

~18 cases including: urgent pain, thin data, consent ignored (clinical / device / env), under-18 block, conflicting SDF, TRT flag, pain overrides labs, fertility gated, etc.

---

## 6. Closed-loop metrics & fairness

Synthetic cohort models invited → assessed → referred → referral_completed.  
Fairness chart = **author-built synthetic method demo**, not real-world bias.  
**Trust:** not measured (planned Likert method in metrics notes).  
**Cultural review:** Arabic has **not** had external Gulf native reader sign-off yet — keep pending until done.

---

## 7. What we don’t do

See in-app `/boundaries`: no diagnosis, no medication advice, no real PHI backend, no validated accuracy claim, no auto fertility referral, no insurance/employment use.

---

## 8. Licences & credits

| Component | Licence / note |
| --- | --- |
| Next.js, React, Zustand, Recharts, lucide-react, clsx | MIT (npm) |
| Tailwind CSS | MIT |
| `@google-cloud/vertexai` | Apache-2.0 |
| Fonts (next/font) | Respective open font licences |
| Curated research stubs | Titles/snippets point to public org pages (WHO, AUA, ASRM); not redistributed PDFs |
| Synthetic population | Generated by SeedShield authors — not a third-party dataset |

---

## 9. Privacy

Browser Zustand only. Reset clears demo. Logs should not contain real PHI. Synthetic records only in seed/cohort code.

---

## 10. Submission

See `docs/SUBMISSION_HACK2SKILL.md` — prototype + TECH docs by **20 Nov 2026**; submit early (**19 Nov**). Q&A: `docs/QA_PREP.md`. Clinician pack: `docs/CLINICIAN_*`.

---

## 11. Validation plan

1. External clinician YES/NO/CHANGES on one-pager  
2. Gulf Arabic reader pass on key screens  
3. Optional n=3–5 anecdotal trust notes  
4. Pilot with validated partners only; keep Simulated tags until then  

---

*Document version aligned with repository code.*
