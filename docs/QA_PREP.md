# Q&A prep — honest answers

## Is this validated?
No. Triage rules are **guideline-derived, pending clinical review**. MVI bands are illustrative. We do not claim CE/FDA or clinical-grade accuracy.

## Where does the data come from?
Prototype: browser sandbox + **synthetic** cohort (~500) + optional simulated device/kit uploads. No real patient PHI on a server. Live env/wearable integrations are labeled simulated unless wired.

## What if triage is wrong?
Human review gate before specialty/fertility. User can override in demo. Urgent red flags send people to care now — the app does not treat emergencies. Clinician remains responsible for clinical decisions.

## How does it connect to real hospital systems?
Not in this prototype. Architecture reserves consented category pulls and clinician inbox. Pilot would use approved health-information exchanges under UAE governance — never wholesale chart dumps.

## Who is liable?
The app is a **screening information** prototype. It does not practice medicine. Liability for diagnosis and treatment sits with licensed clinicians and health systems. Users get explicit “screening ≠ diagnosis” boundaries.

## Why Gemini if rules already triage?
Rules = safety floor. Gemini = Amri-style early-warning innovation (Radar/Investigate) and dynamic multi-factor foresight that rules cannot narrate. Gemini cannot override locked triage.

## Do you use real Google Search?
When Vertex credentials + grounding are configured, Radar uses Search. Otherwise curated public stubs labeled simulated — fail honest, not fake.

## Is the referral real now?
Part of it. The person can check a clinician's licence with the regulator, create a private video link, download a calendar file with reminders, and create a summary they approve and share themselves. We send nothing. Verified specialist routing and partner teleconsult are the next step and need agreements; the in-app clinic queue is a labelled demo. See `docs/REFERRAL_INTEGRATION.md`.

## What real inputs does it use?
What the person types: lab values (testosterone with an optional repeat, fasting glucose), shift work, hours outdoors, sitting time, work stress. Heat and air quality are live for the area (OpenWeatherMap), not the person's own exposure; we estimate personal exposure from their outdoor hours and say so. Wearables and at-home kits are still simulated.

## Why does one low testosterone go to primary care?
A single reading is commonly rechecked (AUA 2018 advises a second early-morning measurement). On 1,726 US men from NHANES, sending every single low reading to a specialist would have routed 20.5% of them. A confirmed low reading, or a semen or anatomical cue, still opens the specialist gate with human review. The 300 ng/dL threshold is waiting for clinician sign-off.

## Does the NHANES check prove it works?
No. It shows the rules behave as written on real measurements and that safety rules hold. NHANES has no infertility labels, so it says nothing about clinical accuracy.

## Which semen limits do you use?
WHO 6th edition (2021) lower reference limits: concentration 16 million/mL, total motility 42%, normal forms 4%. A value below a limit is a screening cue, not a diagnosis.

## Is it discreet?
Discreet mode gives a neutral tab title, blurs sensitive text until tapped, and offers a quick exit. Calendar entries and file names use neutral words. Nothing is stored in the browser. Arabic and English only; the Arabic needs native review.
