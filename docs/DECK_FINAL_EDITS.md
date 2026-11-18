# Deck final edits (paste into the Google Slides / PowerPoint source)

Updated for the real, self-arranged referral step (video link, calendar reminders, approved summary) and discreet mode.

Based on the exported `SeedShield.pdf` (16 pages). Page numbers are the deck's own.
The PDF cannot be edited from the repo, so these are exact replacements.

## Page 1 — Team name

Replace `Team Name: SeedShield` with:

```
Team Name: Men need
```

(Product name SeedShield stays in the problem statement and everywhere else.)

## Page 3 — Team Capability Summary (keep under 1,000 characters)

Replace the bullet `• Data: synthetic only; no real patient information.` with:

```
• Data: synthetic demo persona; public NHANES data for rule checks; no real patient information collected.
```

## Page 6 — How will success be measured

Replace `Prototype (now, synthetic data only)` with `Prototype (now)`.
Replace the Safety bullet with:

```
• Safety: 23/23 automated triage tests pass, including red-flag cases, unconsented data ignored, under-18 blocked, and a single low testosterone reading sent to primary care instead of a specialist. Rules also run on 1,726 men from US NHANES 2015–2016 with all 9 safety invariants holding (a rule-behaviour check, not clinical accuracy).
```

## Page 7 — Evidence supporting the approach (add one item at the end)

```
Our testing (real public data, not clinical accuracy)
9. US CDC NHANES 2015–2016 (public domain): triage rules run end to end on 1,726 men aged 18–54. All 9 safety invariants hold and flags match their reference thresholds. This check changed a rule: a single total testosterone <300 ng/dL first sent 20.5% of men (353) to the specialist gate; a single low reading now goes to primary care with a repeat early-morning test (AUA 2018 advises confirming a low value), and the specialist gate opens only on a confirmed low value or another cue. NHANES has no infertility labels, so no accuracy is claimed. Clinician sign-off on the threshold is pending. Report: docs/validation/NHANES_2015-2016.md in the repo.
```

## Page 8 — Data sources (add rows)

| source | Type | Owner | Sensitivity | Permission / Personal Data? |
| --- | --- | --- | --- | --- |
| OpenWeatherMap API (heat, humidity, air quality) | Live public weather data, fetched by our server | OpenWeather | Low | Area-level, not the person's own exposure. Location is rounded to about 1 km in the browser before it leaves the device. Falls back to simulated values |
| User-entered labs and weekly self-report | User-entered, unverified | User | High if real | Clinical/lab and self-report consent; stays in the browser, not stored by us |
| Clinician summary and calendar file | Generated in the browser from the user's own entries | User | High if real | Created only on request; the user approves, downloads and shares it. SeedShield sends nothing. No name or contact details |
| Jitsi Meet video room (meet.jit.si) | Free public video service; we only generate a random room link | Jitsi / 8x8 | Medium (live video) | We never see or record the call. Anyone with the link can join, so it is shared only with the user's chosen clinician |
| NHANES 2015–2016 | Public survey and lab data | US CDC / NCHS | Low (de-identified, public domain) | Rule validation only; no re-identification attempted |

Also change the row `At-home kit / lab cues` to: `At-home kit cues | Simulated | User (demo) | High if real | Opt-in consent; screening only` (labs are now user-entered, listed separately above).

## Page 9 — Risks and safeguards (add two bullets)

```
● Discreet use — Discreet mode shows a neutral tab title, blurs sensitive text until tapped, and offers a quick exit. Calendar entries and file names use neutral wording ("Health check-in") so nothing sensitive appears on a shared phone. Nothing is stored in the browser.
● Referral limits — The real next step is self-arranged: a private video link, a calendar file with reminders, and a summary the user approves and shares. SeedShield does not supply, verify or contact clinicians, and sends nothing. The simulated clinic queue is labelled Demo only.
```

## Page 10 — Hardware (change one bullet)

Replace `• Environment heat / air-quality feeds` with:

```
• Environment heat / air-quality: live OpenWeatherMap data via our server, with a labelled simulated fallback
```

## Page 12 — Path to pilot (add after Integration)

```
What works today (self-arranged, no partner needed): a private video-room link, a calendar file with reminders (visit and follow-up), and a user-approved summary the person gives to a clinician they choose. SeedShield sends nothing.
Next step, pending partnerships: verified specialist routing, partner teleconsult booking and referral tracking. These need agreements, clinician verification and data-protection review, and are not built. The simulated clinic queue in the app is labelled Demo only. No volunteer pilot has been run.
```

## Page 13 — Third-party materials (add one line)

```
Third-party data and services: OpenWeatherMap API (free tier, used under its terms; source shown in the app); Jitsi Meet public service for video links (used under its terms; we only generate the link); US CDC NHANES public-use data (public domain).
```

## Do not claim

- A volunteer pilot, a verified urologist network, or a teleconsult partner (none exist).
- Clinical accuracy from NHANES (it checks rule behaviour only).
- A connected referral network, verified specialists, or a partner teleconsult service (video links and summaries are self-arranged by the user; the clinic queue is a labelled demo).
- That the heat reading is the person's own exposure (it is area-level; their own hours outdoors and shift work are self-entered).
- That Arabic copy is clinically reviewed (it needs native-speaker and clinician review; Arabic and English only).
