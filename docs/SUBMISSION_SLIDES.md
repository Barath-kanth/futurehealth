# Future Health submission — slide fill-in (from official template)

Use with: `[PUB] Future Health Digital Innovation Challenge _ Submission Template.pptx`  
Architecture diagram detail: `docs/ARCHITECTURE.md` · Live: https://seedshield-agents-gmv4iqwxgq-uc.a.run.app

---

## Slide 1 — Team / problem

**Team name:** Men need (as registered on the Hack2skill portal; deck page 1 must match)  
**Problem statement (short):**  
Men in the Gulf lack a private, early, trusted path for male reproductive **health screening** before crisis. Heat, work, sleep, and stigma delay care. SeedShield is a consent-first front door: Safe Triage + quiet early warning — **screening ≠ diagnosis**.

---

## Slide 4 — Architecture or workflow diagram * (required)

Paste the diagrams from `docs/ARCHITECTURE.md` (or redraw from Mermaid below).

**One-line caption:**  
Next.js on **Cloud Run** · Safe Triage (rules) · 7 agents (Scheduler) · Firestore + BigQuery · Gemini required for analytics (switched off in the public demo for cost; falls back to rules).

---

## Slide 5 — Target users and intended outcome *

**Users:** Adult men 18+ in UAE/Gulf (demo persona Tariq, 34); clinicians/reviewers via Analytics.  
**Outcome:** Earlier, consented next-step guidance (self-care → primary → specialty gated → urgent) with opt-in doctor notify/booking — without diagnosing or auto-fertility referral.

---

## Slide 6 — How will success be measured? *

- Triage safety tests pass (23/23)  
- Closed-loop synthetic funnel (invited→assessed→referred→completed)  
- Fairness proxies on synthetic cohort (illustrative)  
- Demo robustness: live link + offline rules path  
- (Pilot later) time-to-first clinician contact; referral completion — not claimed validated yet

---

## Slide 7 — Evidence supporting the approach *

- WHO Laboratory Manual 6th ed. (2021) — semen lab / thermal context themes  
- AUA/ASRM Male Infertility Guideline 2020/2021 — evaluation pathway themes  
- EAU / emergency teaching — acute scrotum → urgent  
- Own simplifications labeled in `TECH.md` (MVI bands invented for demo)
- Real-data check: triage rules run end to end on 1,726 men aged 18–54 from NHANES 2015–2016 (US CDC public data). All 9 safety invariants hold; flags agree with their reference thresholds. Finding that changed the rules: a single total testosterone below 300 ng/dL first sent 20.5% of men (353 of 1,726) to the specialist gate. A single low reading now goes to primary care with a repeat early-morning test, and the specialist gate opens only on a confirmed low value or another cue; on this sample 0 men reach it on one reading. Clinician sign-off on the threshold is still pending. This is a rule-behaviour check, not an accuracy study (no infertility labels in NHANES). Details: `docs/validation/NHANES_2015-2016.md`

---

## Slide 8 — Data sources and legal right to use them *

| Source | Type | Owner | Sensitivity | Permission |
| --- | --- | --- | --- | --- |
| Demo persona Tariq | Synthetic | SeedShield authors | Low | Created for challenge |
| ~500 synthetic cohort | Synthetic | SeedShield authors | Low | Author-built |
| Live heat + AQI (OpenWeatherMap, when key set) | Public API, live | OpenWeatherMap | Low (coarse ~1 km location) | Environment consent; falls back to simulated feed |
| Env heat/AQI (simulated fallback) | Simulated | SeedShield | Medium | Vault opt-in |
| Self-report form (shifts, heat hours, sitting, stress) | User-entered | User | Medium | Self-report consent; stays in browser |
| Referral packet (mock) | Minimum-necessary fields only | SeedShield | Low | Explicit opt-in; mock endpoint, nothing stored or forwarded |
| User-entered lab values (testosterone, fasting glucose) | User-entered, unverified | User | High if real | Clinical/lab consent; stays in browser |
| NHANES 2015–2016 (US CDC/NCHS) | Public survey and lab data | US government | Low (de-identified, public domain) | Public use; rule validation only |
| Wearable streams | Simulated | User consent | Medium | Vault opt-in |
| Curated research stubs | Public literature pointers | Public | Low | Attribution in Radar |
| No real PHI on servers | — | — | — | Browser demo + synthetic persist |

---

## Slide 9 — Risks and safeguards *

| Risk | Safeguard |
| --- | --- |
| Misdiagnosis | Rules-only triage; “screening ≠ diagnosis”; `/boundaries` |
| Medication harm | The AI guide refuses start/stop advice (fixed rule, runs before Gemini) |
| Consent bypass | `applyConsents()` before triage; tests for ignored flags |
| Agent overreach | Agents cannot change locked triage |
| Privacy / insurance | Vault: no insurance/employment; substance flags opt-in only |
| Self-harm | Crisis redirect in doctor chat |
| Overstated Gulf claims | Heat/shift as screening cues / hypothesis in TECH.md |

---

## Slide 10 — Hardware

Optional simulated watch / home kit — **no physical hardware required for demo**. Sourcing N/A; labeled Simulated.

---

## Slide 11 — Login / guest

**No login required.** Age gate 18+ once per session → Continue. Full features available after gate (demo persona).

---

## Slide 12 — Path to pilot and scale *

1. Clinician review of rules (emails in `docs/`)  
2. Partner clinic / SEHA-style pilot under UAE data governance  
3. Consented EHR category pulls (not chart dumps)  
4. Keep Simulated tags until validation partners  
5. Cost: Cloud Run min-instances → 0 after demos; Firestore not Cloud SQL  
6. Works today without partners: a private video-room link, a calendar file with visit and follow-up reminders, and a user-approved clinician summary the person shares themselves. Next step, pending partnerships: verified specialist routing and partner teleconsult booking. The in-app clinic queue is a labelled mock.

---

## Slide 13 — Pre-existing IP / third-party *

- Next.js, React, Tailwind, Zustand, Recharts, Lucide — OSS licenses (MIT/Apache as applicable)  
- `@google-cloud/*` — Google Cloud client libraries  
- No proprietary third-party clinical dataset  
- SeedShield rules/UI — team-authored for this challenge

---

## Slide 14 — Conflict of interest *

Declare none (or list if any with organizers/partners/judges).

---

## Before you submit

- [ ] Live link works in private window  
- [ ] TECH.md attached / linked  
- [ ] Architecture slide uses diagram from ARCHITECTURE.md  
- [ ] Video + deck backup  
- [ ] Clinician email sent (or keep “pending clinical review”)  
- [ ] Arabic reader pass (or keep cultural review Pending)
