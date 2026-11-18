# Deck final edits (paste into the Google Slides / PowerPoint source)

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
| OpenWeatherMap API (heat, humidity, air quality) | Live public weather data, fetched by our server | OpenWeather | Low | Coordinates rounded to ~1 km, no name or health data sent; falls back to simulated values |
| User-entered labs and weekly self-report | User-entered, unverified | User | High if real | Clinical/lab and self-report consent; stays in the browser, not stored by us |
| NHANES 2015–2016 | Public survey and lab data | US CDC / NCHS | Low (de-identified, public domain) | Rule validation only; no re-identification attempted |

Also change the row `At-home kit / lab cues` to: `At-home kit cues | Simulated | User (demo) | High if real | Opt-in consent; screening only` (labs are now user-entered, listed separately above).

## Page 10 — Hardware (change one bullet)

Replace `• Environment heat / air-quality feeds` with:

```
• Environment heat / air-quality: live OpenWeatherMap data via our server, with a labelled simulated fallback
```

## Page 12 — Path to pilot (add after Integration)

```
Current limits: the referral handoff is a mock endpoint that sends a minimum-necessary packet only after opt-in; nothing is stored or forwarded. Live teleconsult and verified-specialist routing need partner agreements and are not built. No volunteer pilot has been run.
```

## Page 13 — Third-party materials (add one line)

```
Third-party data and services: OpenWeatherMap API (free tier, used under its terms; source shown in the app); US CDC NHANES public-use data (public domain).
```

## Do not claim

- A volunteer pilot, a verified urologist network, or a teleconsult partner (none exist).
- Clinical accuracy from NHANES (it checks rule behaviour only).
- "Live" referral booking (the handoff is a mock).
