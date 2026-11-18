# Referral integration contract (for a future partner)

Status: **not connected to any partner.** The live app only creates a video link, a calendar file, and a summary the person shares themselves. The in-app clinic queue is a labelled demo that posts to `/api/referral/mock`.

This page says what a partner would need to accept, so the next step is a clear agreement rather than a rewrite.

## Packet (already built and validated)

Sent only after the person ticks consent. Defined in `src/lib/referral-packet.ts`; unknown fields are rejected.

| Field | Meaning |
| --- | --- |
| `version` | `"1"` |
| `kind` | `primary_care`, `teleconsult`, or `specialist_review` |
| `tier` | Safe Triage result (never `urgent`; urgent is never sent through the app) |
| `reasonCodes` | internal signal ids only, up to 20 |
| `consentCategoriesUsed` | which consents fed the result |
| `humanReviewRequired` | boolean |
| `userOptIn` | always true |
| `createdAt` | ISO timestamp |

Never included: name, contact details, chat text, exact location, raw lab values (the person can attach values to the summary themselves).

## What a partner must provide before we switch it on

1. A signed data-sharing agreement and data-protection review under the applicable UAE health-data rules.
2. A clinician-verification process, so "verified specialist" means something we can show.
3. An endpoint that returns a receipt id, and a way to tell the person the outcome (booked, declined, needs more information).
4. A named clinical owner for the rules in `docs/CLINICIAN_SIGNOFF_SHEET.md`.

## What we will not do

- Route urgent symptoms through a booking flow.
- Book fertility services automatically.
- Share anything without the person's tick on that request.
- Describe a partner as connected before the agreement exists.
