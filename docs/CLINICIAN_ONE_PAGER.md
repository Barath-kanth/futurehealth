# SeedShield — Safe Triage rules (1 page)

**Product:** Upstream male reproductive health **screening** (18+), Gulf privacy-first.  
**Not:** diagnosis, medication advice, automatic fertility booking, validated clinical device.

## Pathways (deterministic)

| Outcome | When (simplified) |
| --- | --- |
| Not enough information | Sparse clinical anchors; no clinical-domain elevated cues |
| Self-care | Enough data; lifestyle/environment only |
| Primary care | Metabolic / infectious / multi clinical elevated cues |
| Andrology / Urology | Semen or anatomical screening cues, or a confirmed low testosterone (two readings below 300 ng/dL) → **human review**. A single low reading goes to primary care with a repeat early-morning test. |
| Fertility services | Multiple reproductive cues → **clinician-gated only** |
| Urgent | Sudden testicular pain **or** infectious + systemic feverish cue |

## Consent rule

Non-consented streams/flags are **stripped before triage**. A red flag without consent must not change the pathway.

## Guideline mapping (named)

| Rule | Source (named) | Our use |
| --- | --- | --- |
| Semen parameter thresholds as **screening cues** | WHO Laboratory Manual for the Examination and Processing of Human Semen, **6th ed. (2021)** | Flag out-of-range device/lab values; not diagnose |
| Structured male evaluation themes (history, semen, hormones, anatomy) | **AUA/ASRM Guideline: Diagnosis and Treatment of Infertility in Men (2020/2021)** | Pathway labels only; specialty after human review |
| Acute scrotal pain → urgent evaluation | Emergency / urology teaching (e.g. EAU acute scrotum pathways) | `acuteTesticularPainFlag` → urgent; app cannot exclude torsion |
| Metabolic BMI / glucose as upstream factors | General primary-care metabolic screening practice | Primary-care routing, not endocrine diagnosis |
| SDF as adjunct cue | Andrology literature / ASRM discussions on SDF | Specialty cue when elevated; **our simplification** for prototype |
| MVI bands 60/75 | **SeedShield prototype only** | Illustrative — **not** guideline cut-points |
| TRT flag without start/stop advice | Clinical knowledge that exogenous androgens can suppress spermatogenesis | Red flag for clinician discussion only |

Where unmarked: **our simplification** for a competition prototype.

## Safety tests (run `npm run test:triage`)

Includes: urgent pain, thin data, self-care heat, metabolic primary, semen→andrology, fertility gated, infectious primary, infectious+systemic urgent, under-18 block, consent ignored (clinical/device/env), conflicting SDF, TRT flag, cryptorchidism, healthy self-care, pain overrides labs.

**Ask:** YES / NO / CHANGES (bullets). Screening prototype only.
