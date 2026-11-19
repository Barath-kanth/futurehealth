# Demo video narration (under 3:00) — read aloud, in this order

Live site: https://seedshield-agents-gmv4iqwxgq-uc.a.run.app
Before recording: open the site once to warm it up, pass the age gate, and turn on the self-report, clinical-lab and environment consents on Privacy.
Say "demo persona" when you show Tariq.
Do not press "Run Gemini Agent" on What-if: Gemini is switched off in this public demo, so it returns "unavailable". Use the sliders only.
Do not say: clinically validated, live specialist network, partner clinics, pilot results, or that Gemini is running.

## Narration

**[0:00 · Home `/`]**
SeedShield is a consent-first front door for male reproductive health in the Gulf: a safe next step, earlier. Screening, not diagnosis. Adults eighteen and up, no login, in Arabic and English.

**[0:15 · Privacy `/vault`]**
This is Tariq, thirty-four. His file is synthetic: no real patient records. Sharing is off by default, and doctor alerts and booking are opt-in. Non-consented signals are ignored.

**[0:30 · Next step `/triage`, "Tell us about your week"]**
From consented signals, like sleep, shifts and heat, the app suggests a next step and shows its reasons. Heat and air quality are optional signals that studies associate with semen quality. They are associations, not proof.

**[1:05 · Next step, "My lab results"]** (type 540 as nmol/L, then 250 ng/dL, then add a repeat of 260)
Tariq can type his own lab results in either unit. A wrong unit is rejected. One low testosterone reading goes to primary care for a repeat test. Two low readings open specialist review, which a doctor must approve.

**[1:25 · same page, red-flag and thin-data tiles]**
Sudden testicular pain goes straight to urgent care. With thin data, the app asks for more information instead of guessing. These rules are deterministic, and AI cannot override them.

**[1:40 · Next step, "Care access"]**
The care step is self-arranged: a regulator directory link, a private video link, a calendar file, and a summary Tariq approves himself.

**[1:55 · Watch `/agents`]**
Quiet Watch is the optional early-warning layer. It alerts from consented signals but cannot override Safe Triage. Nothing goes to a doctor or gets booked without opt-in.

**[2:10 · AI guide `/chat`]** (ask: "What does my sleep result mean?")
The AI guide answers within fixed safety rules. It is not a clinician. Each reply says who wrote it. In this public demo, replies come from the rules.

**[2:25 · What-if, Dynamic Vitality Agent `/studio`]** (move the sleep or heat slider)
On What-if, the Dynamic Vitality Agent lets us nudge sleep or heat, and the illustrative score updates. It is still screening, not a fertility prediction.

**[2:38 · Devices `/devices`, then Lab ranges `/ranges`]**
Devices shows where the consented inputs come from, all labelled Simulated. Lab ranges shows WHO-aligned screening windows, labelled demo, not a lab report.

**[2:48 · For reviewers `/analytics`]**
On about five hundred synthetic profiles we show the funnel and a fairness check. Twenty-three of twenty-three triage cases pass, with a hundred and four automated checks. This measures the method; it is not a real-world result.

**[2:57 · Header]** (click Discreet, then العربية)
Discreet mode blurs sensitive text. The app works in Arabic.

**[3:02 · Our limits `/boundaries`]**
Our limits: synthetic data, clinician review requested but not received, no diagnosis, no medication advice. Screening, not diagnosis. Thank you.

## Timing check

Spoken words are about 354, which is roughly 2:20 to 2:40 at a normal pace. The cues are targets, not a stopwatch, and the screen clicks need about 20 seconds more. If you run long, shorten the reviewers and Devices/Ranges lines first.

## Changes from the previous version

- Added AI guide, What-if (Dynamic Vitality Agent), Devices and Lab ranges to the main narration.
- Moved the reviewers page into the main flow.
- Cut the Watch, care-access and privacy wording to make room.
- Added the warning not to press Run Gemini Agent, since it returns "unavailable" while Gemini is off.
