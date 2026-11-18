# SeedShield — numbers a clinician is asked to confirm

One page. Every cut-off the app uses to route a person, with its source. Screening prototype, not a diagnostic device. Tick one box per row and add changes.

**Reviewer:** ____________________  **Specialty:** ____________________  **Date:** ____________

| # | Rule in the app | Value used | Source we cite | Agree | Change to |
| --- | --- | --- | --- | --- | --- |
| 1 | Single total testosterone | below 300 ng/dL: primary care plus repeat early-morning test | AUA testosterone deficiency guideline (2018): confirm with a second early-morning measurement | ☐ | |
| 2 | Confirmed low testosterone | first and repeat both below 300 ng/dL: specialist review after human review | Same | ☐ | |
| 3 | Semen concentration | below 16 million/mL | WHO Laboratory Manual, 6th ed. (2021), 5th centile of fertile men | ☐ | |
| 4 | Total motility | below 42% | WHO 6th ed. (2021) | ☐ | |
| 5 | Normal forms | below 4% | WHO 6th ed. (2021) | ☐ | |
| 6 | Sperm DNA fragmentation | 25% or higher | Andrology literature; our simplification | ☐ | |
| 7 | BMI | 30 or higher: primary care | WHO obesity definition | ☐ | |
| 8 | Fasting glucose | 110 mg/dL or higher: watch; 126 or higher: elevated | WHO impaired fasting glucose (ADA uses 100) | ☐ | |
| 9 | Sudden testicular pain | goes straight to urgent care, no booking | Acute scrotum teaching (torsion cannot be excluded by an app) | ☐ | |
| 10 | Prior infection recorded or infectious screening cue | raises a screening cue for clinician-decided testing; never a diagnosis | Our simplification | ☐ | |
| 11 | Specialist and fertility routes | always behind human clinical review | Product safety rule | ☐ | |
| 12 | Screening, not diagnosis wording | shown on every screen and on the summary | Product safety rule | ☐ | |

## Questions we cannot answer ourselves

1. Is 300 ng/dL the right single-value trigger for a screening prototype, or should it differ with age or assay?
2. Is "two readings below 300" a reasonable definition of "confirmed" for opening the specialist gate?
3. Is routing every BMI of 30 or higher to primary care (573 of 1,639 measured US men aged 18-54, about 35%, in NHANES 2015-2016) too broad?
4. Is the 25% SDF cut-off acceptable as a screening cue, or should it be removed?
5. Anything the app should never say, or should always say, in the summary a patient hands to you?

## Evidence we can show you

- Rules run on 1,726 men from NHANES 2015-2016: `docs/validation/NHANES_2015-2016.md`. This checks that the rules behave as written. It is not an accuracy study, and NHANES has no infertility labels.
- Safety tests: `npm run test:triage` (23 cases) and `npm run test:submission` (91 checks).

**Reply with YES / NO / CHANGES.** Until a clinician replies, the app says "guideline-derived, pending clinical review".
