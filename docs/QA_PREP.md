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
