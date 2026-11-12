# Future Health submission — slide fill-in (from official template)

Use with: `[PUB] Future Health Digital Innovation Challenge _ Submission Template.pptx`  
Architecture diagram detail: `docs/ARCHITECTURE.md` · Live: https://seedshield-agents-fpger4i3jq-uc.a.run.app

---

## Slide 1 — Team / problem

**Team name:** SeedShield (or your registered name)  
**Problem statement (short):**  
Men in the Gulf lack a private, early, trusted path for male reproductive **health screening** before crisis. Heat, work, sleep, and stigma delay care. SeedShield is a consent-first front door: Safe Triage + quiet early warning — **screening ≠ diagnosis**.

---

## Slide 4 — Architecture or workflow diagram * (required)

Paste the diagrams from `docs/ARCHITECTURE.md` (or redraw from Mermaid below).

**One-line caption:**  
Next.js on **Cloud Run** · Safe Triage (rules) · 7 agents (Scheduler) · Firestore + BigQuery · Gemini/Search optional, fail closed.

---

## Slide 5 — Target users and intended outcome *

**Users:** Adult men 18+ in UAE/Gulf (demo persona Omar, 34); clinicians/reviewers via Analytics.  
**Outcome:** Earlier, consented next-step guidance (self-care → primary → specialty gated → urgent) with opt-in doctor notify/booking — without diagnosing or auto-fertility referral.

---

## Slide 6 — How will success be measured? *

- Triage safety tests pass (19/19)  
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

---

## Slide 8 — Data sources and legal right to use them *

| Source | Type | Owner | Sensitivity | Permission |
| --- | --- | --- | --- | --- |
| Demo persona Omar | Synthetic | SeedShield authors | Low | Created for challenge |
| ~500 synthetic cohort | Synthetic | SeedShield authors | Low | Author-built |
| Env heat/AQI (demo) | Simulated / consented feed | User consent | Medium | Vault opt-in |
| Wearable streams | Simulated | User consent | Medium | Vault opt-in |
| Curated research stubs | Public literature pointers | Public | Low | Attribution in Radar |
| No real PHI on servers | — | — | — | Browser demo + synthetic persist |

---

## Slide 9 — Risks and safeguards *

| Risk | Safeguard |
| --- | --- |
| Misdiagnosis | Rules-only triage; “screening ≠ diagnosis”; `/boundaries` |
| Medication harm | Doctor chat refuses start/stop advice |
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
