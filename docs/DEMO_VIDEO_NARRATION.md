# Demo video narration (about 2:50) — read aloud, in this order

Live site: https://seedshield-agents-gmv4iqwxgq-uc.a.run.app
Before recording: open the site once to warm it up, pass the age gate, and turn on the self-report, clinical-lab and environment consents on Privacy.
Say "demo persona" when you show Tariq. Do not say: clinically validated, live specialist network, partner clinics, pilot results, or that Gemini is running.

## Narration

**[0:00 · Home `/`]**
SeedShield is a consent-first front door for male reproductive health in the Gulf: a safe next step, earlier. Screening, not diagnosis. For adults, eighteen and up, with no login, in Arabic and English. We never assume marriage or family plans.

**[0:15 · Privacy `/vault`]**
This is Tariq, thirty-four. His file is synthetic: no real patient records. SeedShield only uses signals he agrees to share. Sharing is off by default, and doctor alerts and booking are opt-in. Consent is the safety filter: signals without consent are ignored.

**[0:35 · Next step `/triage`, "Tell us about your week"]**
From consented signals, like sleep, shifts and heat, the app suggests a next step and shows its reasons. Heat and air quality come live for the area. Studies associate them with semen quality; those are associations, not proof.

**[0:52 · Next step, "My lab results"]** (type 540 as nmol/L, then 250 ng/dL, then add a repeat of 260)
Tariq can also type his own lab results, in either unit. A wrong unit is rejected. One low testosterone reading goes to primary care for a repeat test, not to a specialist. Two low readings open specialist review, and a doctor must approve it.

**[1:15 · same page, red-flag and thin-data demo tiles]**
Sudden testicular pain goes straight to urgent care. With thin data, the app asks for more information instead of guessing. These rules are deterministic. AI cannot override them.

**[1:28 · Next step, "Care access"]**
The care step is self-arranged: a pointer to the regulator's directory, a private video link, a calendar file with neutral wording, and a summary Tariq approves himself. Nothing is sent by us.

**[1:45 · Watch `/agents`]**
Quiet Watch is the optional early-warning layer, built from seven agents. It can alert from consented signals, but it cannot override Safe Triage. Nothing goes to a doctor or gets booked unless the user opts in.

**[2:03 · For reviewers `/analytics` (under More)]**
On about five hundred synthetic profiles we show the funnel and a fairness check. Twenty-three of twenty-three triage safety cases pass, with a hundred and four automated checks in total. We also ran the rules on 1,726 men in public NHANES data, to check behavior, not accuracy. This shows how we would measure; it is not a real-world result.

**[2:25 · header buttons]** (click Discreet, then العربية)
Discreet mode blurs sensitive text and gives a quick exit, and the app works in Arabic.

**[2:35 · Our limits `/boundaries`]**
Our limits: synthetic data only, clinician review requested but not received, no diagnosis, no medication advice. The Gemini analytics layer is built but switched off in this public demo to control cost. Screening, not diagnosis. Thank you.

## Optional extras (only if you are well under 3 minutes)

- **Devices `/devices`:** "This is where Tariq's consented inputs come from: watch, environment, PC, scale, and simulated hormone and semen kits. All labelled Simulated. It is the file, not a diagnosis."
- **My health `/analyst`:** "On My health, What-if lets us nudge sleep or heat. The illustrative score and next-step cues update from those inputs. Still screening, not a fertility prediction."
- **Reminders `/reminders`:** "Reminders turns those cues into simple follow-ups you can complete."
- **Lab ranges `/ranges`:** "Ranges shows WHO-aligned screening windows, labelled demo, not a lab report."
- **Restore:** with Watch on, heat and air quality keep updating from the area feed. Press "Restore Tariq" when you are done.

## What changed from the earlier draft

- "Omar" is now Tariq.
- "Nineteen of nineteen safety tests" is now 23 of 23 triage cases and 104 automated checks.
- Added the lab-entry flow, the self-arranged care step and the NHANES rule check.
- Heat and air quality are live for the area; sleep and stress are typed or simulated, so the script no longer says they update in real time.
- Added the Gemini line in the limits so the deck and the video agree.
- Cut the devices, reminders, ranges and vitality-index sections to stay under three minutes; they are in the optional list.
