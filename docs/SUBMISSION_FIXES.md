# Submission fixes, page by page (paste-ready)

Page numbers are from the exported `SeedShield.pdf` (16 pages). Edit your source document and export again.

## One set of numbers (re-run on 18 Nov 2026, use only these)

| What | Number | How to reproduce |
| --- | --- | --- |
| Triage safety cases | 23 of 23 pass | `npm run test:triage` |
| Automated submission checks | 91 of 91 pass | `npm run test:submission` |
| NHANES 2015-2016 men run through the rules | 1,726 (testosterone measured for 1,547) | `npm run validate:nhanes` |
| NHANES safety invariants | 9 hold, 0 violations | same report |
| Men with a single total testosterone below 300 ng/dL | 353 of 1,547 (22.8%): all go to primary care, none straight to a specialist | same report |

Other counts you may have seen (19/19, 45, 42/42, 30/30) are not what the code reports today. Do not use them.

---

## Page 1: team name

> **Team Name:** Men need (product: SeedShield)

Team size stays 2.

## Page 3: Team Capability Summary (max 1,000 characters)

```
Men need is a 2-person team. Barathakanthan (lead): DevOps and cloud engineer working with AI. Kogileshwaran: AI developer. We built and deployed SeedShield, a working prototype.
Capabilities:
• Full-stack: Next.js consent vault, Safe Triage, lab-entry form, live area heat and air quality, self-arranged care step (video link, calendar reminders, approved summary), discreet mode, English and Arabic.
• Google Cloud: Cloud Run, Scheduler, Firestore and BigQuery live; Vertex AI Gemini built and tested, off in the public demo for cost.
• Safety: deterministic triage AI cannot override; consent filter first; screening, not diagnosis; 23 triage cases, 104 automated checks.
• Evidence: cues follow WHO and AUA/ASRM guidance; rules also run on 1,726 men in public NHANES data (rule check, not accuracy). Clinical review requested, not received.
• Data: demo persona is synthetic; users can type their own labs and shift answers; heat and air quality are live for the area. No patient records.
```

## Page 4: diagram

The Lucid link is an edit link. In Lucidchart: Share, then "Anyone with the link can view", and paste the view-only link. Add these boxes:

- Browser: consent vault, lab-entry form (unit checks), Safe Triage and consent filter, discreet mode, English/Arabic.
- Browser to our `/api/env` (coordinates rounded to 2 decimals) to OpenWeatherMap (key stays on the server).
- Care step, all in the browser: private video link (Jitsi Meet), calendar file, user-approved summary the person shares themselves.
- Watch cycle: browser to Cloud Run (7 agents) to Firestore and BigQuery. Draw Vertex AI Gemini as a dashed box labelled "built, off in public demo (cost)".
- Offline: NHANES rule check (public CDC data).
- Future (dashed): partner clinic and verified specialist routing.

## Page 6: How will success be measured

Use this order. The header and the safety line now sit under "Prototype (now)".

```
Success is measured in two layers. We do not claim clinical validation yet.

Prototype (now)
• Safety: 23/23 triage safety cases and 91 automated checks pass, including red-flag cases, unconsented data ignored, under-18 blocked, unit errors rejected, and a single low testosterone sent to primary care for a repeat test.
• Real-data rule check: the rules were run on 1,726 men from NHANES 2015-2016. All 9 safety invariants hold; 353 men with one low testosterone reading go to primary care and none go straight to a specialist. This checks rule behaviour, not clinical accuracy.
• Real inputs: people can type their own lab values and shift answers; heat and air quality are live for their area.
• Funnel on a ~500-person synthetic cohort: invited, assessed, referred, referral completed. These show the method works; they are not real-world results.
• Fairness: outcomes compared by age and residency/nationality (illustrative synthetic proxies); two audit fixes are documented.
• Privacy: sharing is off by default; summaries and bookings only after opt-in.

Pilot (planned, with a clinical partner and user consent)
• Usability check with about 10 adult volunteers first, then a clinical-partner pilot.
• Completed assessments, time to appropriate evaluation, referral completion, user trust (post-use survey, opt-out and deletion rates), fairness by age, residency and language, and safety (red flags routed to urgent care, clinician override rate, harm reports).
Targets will be set with the clinical partner. We make no claim of clinical accuracy.
```

## Page 7: Evidence supporting the approach

Replace the "Our testing" and "Limits" paragraphs, and add two references.

```
Our testing: a synthetic demo persona plus a real-data rule check. 23/23 triage safety cases and 91 automated checks pass. The rules were run on 1,726 men from NHANES 2015-2016 (behaviour and safety only; NHANES has no fertility labels, so no accuracy is claimed). Clinician review of the rules is requested but not yet received. No user study yet.
Limits: findings are associations with small or marginal effects; heat studies are from Singapore and other regions, not hot-arid Gulf settings; the 300 ng/dL testosterone and other cut-offs await clinician sign-off; we make no claim of predictive accuracy.
```

Add to the reference list:

- 9. US CDC, National Health and Nutrition Examination Survey 2015-2016 (public-domain data): https://wwwn.cdc.gov/Nchs/Nhanes/continuousnhanes/default.aspx?BeginYear=2015
- 10. AUA Guideline: Evaluation and Management of Testosterone Deficiency (2018): a low total testosterone should be confirmed with a repeat morning measurement.

Item 8 stays as written (WHO semen manual 6th ed. 2021 and AUA/ASRM). The app now uses the 6th edition limits: 16 million/mL, 42% total motility, 4% normal forms.

## Page 8: Data sources and legal right to use them

Add or replace these rows:

| Source | Type | Owner | Sensitivity | Permission / personal data? |
| --- | --- | --- | --- | --- |
| Demo persona (Omar) | Synthetic | Authors | Low | Not real personal data |
| ~500 synthetic cohort | Synthetic | Authors | Low | Not real PHI |
| Self-entered labs (testosterone, optional repeat, fasting glucose) | User-entered | The user | High | Only when clinical-lab consent is on; unit checks; not saved in the browser; see page 9 for what the server sees |
| Shift and lifestyle answers | User-entered | The user | Medium to high | Only when self-report consent is on |
| NHANES 2015-2016 | Public data (US CDC) | US CDC | Low (de-identified, public domain) | No personal data used by us; offline rule check only |
| OpenWeatherMap heat and air quality | Live, area-level | OpenWeather | Low | Key kept on the server; browser sends coordinates rounded to 2 decimals to our `/api/env`; ODbL licence with visible attribution |
| Video link (Jitsi Meet) | Third-party service | 8x8 / Jitsi | Medium | Link created in the browser; we do not host, see or record the call |
| Calendar file and summary | Generated in the browser | The user | Medium | Downloaded by the person; neutral titles; nothing sent by us |
| Wearable streams, at-home kit values | Simulated | Authors | Medium if real | Labelled Simulated until a validated device exists |
| Research stubs (Radar) | Public literature pointers | Public | Low | In-app attribution |
| Agent logs (Firestore/BigQuery) | Findings metadata | SeedShield / GCP | Low to medium | See page 9; findings can contain some entered values |

## Page 9: Risks and safeguards

**Do not write "No real PHI collected or stored".** In the current public deployment (Gemini off, 19 Nov 2026): triage runs in the browser and nothing is saved in browser storage. The Watch page sends the person's consented values to our Cloud Run server. The agents write findings (which can include some entered values, such as sleep hours, heat hours or SDF %) to Firestore and BigQuery under a shared pseudonymous id, with no name and no account. Raw lab values are not written by the agents. Gemini is switched off, so nothing is sent to Vertex AI. Cloud Run request logs keep the IP address and the coordinates rounded to 2 decimals (about 1 km).

Use this instead:

```
● Privacy: granular consent; sharing off by default; summaries and bookings only after opt-in. Triage runs in the browser and self-entered values are not saved there. The optional Watch page sends consented values to our Cloud Run server; finding summaries (which can include some entered values) are stored in Firestore and BigQuery under a pseudonymous id, with no name and no account. Request logs keep an IP address and a location rounded to about 1 km. Prototype only; real patient use needs a UAE health-data review first.
● Security: HTTPS via Cloud Run; no accounts; the OpenWeatherMap key stays on the server; browser coordinates are rounded before being sent; per-client rate limit on the agent endpoint.
● Unit mix-ups: values are checked for plausibility and units (for example 540 nmol/L is rejected), with the conversion shown.
● Single low reading: never treated as a diagnosis. It sends the person to primary care for a repeat early-morning test; only a confirmed low reading, or another cue, opens specialist review.
● Link sharing: the video link is a public Jitsi room with a random name. Anyone with the link can join, so the person should share it only with their clinician.
● Language: the Arabic text is machine-assisted and awaits native-speaker review.
```

Keep your existing Bias, Explainability, Misuse, Human oversight and Failure modes bullets.

Optional code change (say yes if you want it): stop the Watch page from sending lab values (testosterone, repeat, glucose) to the server. Then the page-9 text could say lab values never leave the browser. It would change what the Watch page shows for hormone cues.

## Page 10: Hardware requirements

```
No hardware is required.
• Heat and air quality: live for the person's area (OpenWeatherMap).
• Labs and shift answers: typed by the user.
• Still simulated and labelled Simulated: wearable streams and at-home kit values.
Sourcing: N/A. Safety: not a medical device; no CE/FDA claim; screening cues only; sudden pain routes to urgent care guidance.
Production path: partner-validated devices under clinical oversight.
```

## Page 11: Login / guest access

```
No account login is required.
1) Open https://seedshield-agents-gmv4iqwxgq-uc.a.run.app/
2) Pass the age gate (18+).
3) Continue; the demo persona Omar is pre-loaded.
Where to find the new features:
• Lab form: Privacy page, switch on "Clinical & laboratory category pulls"; then the Next step page, "My lab results". Try 250 ng/dL, then add a repeat of 260. Type 540 as nmol/L to see the unit check.
• Care step: Next step page, "Care access" (video link, calendar file with reminders, approved summary).
• Discreet mode: the "Discreet" button at the top.
• Arabic: the language button at the top (العربية).
```

## Page 12: Path to pilot and scale

Replace the Integration line and add one line:

```
Integration: start with consented self-entered inputs and live area data; add category-level EHR/lab pulls (not full chart dumps); keep Cloud Run + Firestore/BigQuery; switch on Vertex AI Gemini (built and tested, off in the public demo).
Referral: today the care step is self-arranged (private video link, calendar reminders, a summary the person approves and shares). Verified specialist and teleconsult routing is the next step and needs partner agreements and a clinician-verification process. The in-app clinic queue is labelled Demo only.
```

The timeline stays as is. Page 12 should also say the volunteer usability check comes before any partner pilot.

## Page 13: Pre-existing IP and third-party materials

Clean up the garbled open-source sentence and add the new items:

```
Open-source components (standard licences, checked): MIT (Next.js, React, Zustand, Recharts, Tailwind, clsx); Apache-2.0 (TypeScript, @google-cloud/*); ISC (Lucide).
Third-party services:
• OpenWeatherMap (live heat and air quality): ODbL licence; visible attribution to OpenWeather is shown beside the data. We do not build a reusable weather dataset. https://openweathermap.org/full-price
• Jitsi Meet public service (meet.jit.si, operated by 8x8): used only to create a private video link, subject to its terms of service; free use is limited to 25 active endpoints per month, so a pilot would need a paid or self-hosted instance. https://jitsi.org/meet-jit-si-terms-of-service/
• NHANES 2015-2016: public-domain US government data, used offline for the rule check.
Clinical references (cited, not copied): WHO Laboratory Manual 6th ed. (2021); WHO Infertility Guideline (2025); AUA/ASRM (2020/2021); AUA Testosterone Deficiency Guideline (2018).
Acute scrotum (sudden testicular pain goes to urgent care): EAU Guidelines on Paediatric Urology, Acute Scrotum chapter, https://uroweb.org/guidelines/paediatric-urology/chapter/acute-scrotum ; AUA Medical Student Curriculum, Acute Scrotum, https://www.auanet.org/meetings-and-education/for-medical-students/medical-students-curriculum/acute-scrotum
```

## Not confirmed by me

- The Department of Health link on the care step: the site refused connections from my machine, so please click it yourself.
- Clinician review, native Arabic review and any pilot: none has happened. Keep "requested" and "planned".

---

## Gemini (built and verified live on 18 Nov 2026; off in the public demo since 19 Nov)

**Current status:** to control cloud cost, the public demo runs with `GEMINI_ENABLED=false`. Every Gemini feature falls back to its rule-based path, and each screen says so (chat replies are labelled "Rule-based reply"; the Studio foresight panel says Gemini is switched off). Turning it back on is one setting on Cloud Run, with no code change. The table below is what we measured when it was on.

Gemini on Vertex AI used the Cloud Run service identity (no key file) and the global endpoint.

Two models, chosen by measured speed: `gemini-3.1-flash-lite` (about 2-5 seconds) for interactive features, and `gemini-3.8-flash` (6 to 45 seconds, varies) for the deep foresight analysis.

| Feature | Model | Result on the live site (18 Nov) |
| --- | --- | --- |
| AI screening guide chat (`/chat`) | 3.1-flash-lite | Gemini writes the answers, in English and Arabic, from the consent-filtered screening file (no raw lab values). A refused injection attempt was confirmed. |
| Explanations (`/api/explain`) | 3.1-flash-lite | `vertex-ai`, reworded from the rule engine's own text, about 2 seconds |
| Radar research (Watch cycle) | 3.1-flash-lite | Real Google Search grounding with real source links |
| Investigate chain text (Watch cycle) | 3.1-flash-lite | Used when the reply passes the safety filter, otherwise the rule-based text stays |
| Foresight analytics (`/api/gemini-agent`) | 3.8-flash | available, about 24 seconds; shows "unavailable" if Gemini is down (no simulated output) |
| Triage tier | none | Decided only by the rule engine |

Chat safety design (say this on a slide if you have room):
1. Fixed rules answer self-harm, sudden testicular pain, medicine changes and "is this a diagnosis" first, instantly, without any model.
2. Gemini answers everything else from the person's consented screening file only.
3. An output guard drops any reply that diagnoses, gives a dose or medicine advice, or promises an outcome. Then the rule-based reply is used.
4. Each reply is labelled "Written by Gemini within fixed safety rules", "Fixed safety reply", or "Rule-based reply".

The chat is now an AI guide and says it is not a clinician. The old "simulated clinician" persona is gone from the chat, nav and cards. Do not call it a doctor chat in the deck.

Wording for the slides (pages 3, 7 and the diagram):

> **Gemini on Vertex AI (built and tested; switched off in the public demo to control cost):** multi-factor foresight, plain-language explanations, research for the early-warning agents, and a chat guide that answers within fixed safety rules. It turns on with one setting. Triage stays rule-based either way, and Gemini cannot change the pathway.

Diagram label (dashed box): "Vertex AI Gemini: analytics, explanations, research, chat. Built; off in public demo (cost). Rules decide triage."

Do not write "Gemini runs live" or show a Gemini answer as if it came from the current public link. A screen recording from 18 Nov is fine if it is labelled with that date.

Why Gemini is not used to decide triage: a model's output can't be audited by a clinician the way fixed rules can, and the whole safety story ("AI cannot override triage") depends on this. Keep that sentence.

Note for page 9 (only if Gemini is switched back on): the Gemini foresight prompt includes each signal's drivers, which can contain entered lab values (for example `testosterone=250`, `glucose=...`, `sdf=...`), plus a lifestyle snapshot (heat index, air quality, sleep, stress, shift work, smoking, alcohol, BMI, hydration). No name, contact detail or account is sent. So say in the privacy bullet: "When the optional Gemini analytics run, the person's consented values are sent to Google Vertex AI to produce the analysis; nothing identifying is included." Do not say lab values never leave the browser.
