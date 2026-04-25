# MVP Checklist: Travel Checklist Planner

Use this checklist to implement the MVP defined in `PRD.md` and `PROJECT_CONTEXT.md`.

## 0) Setup and Scope Lock

- [ ] Confirm MVP scope from `PRD.md` (intake form, checklist generation, calendar handoff).
- [ ] Confirm non-goals are excluded from implementation.
- [ ] Confirm timeline model and required bucket order.
- [ ] Confirm MVP country pack: Vietnam.
- [ ] Confirm reminder ownership boundary: calendar handoff only (no OAuth sync).

## 1) Intake Form and Validation (FR-1)

- [ ] Build multi-step traveler intake form.
- [ ] Add required-field and format validations.
- [ ] Add clear error states for invalid inputs.
- [ ] Add submit/continue behavior with progress indication.
- [ ] Add save-progress behavior (local storage) when applicable.

## 2) Scenario Normalization (FR-2)

- [ ] Define canonical normalized scenario shape.
- [ ] Map form fields to normalized rule-engine fields.
- [ ] Add defaults for optional values where safe.
- [ ] Add validation guardrails for incompatible field combinations.

## 3) Rule-Based Checklist Generation (FR-3)

- [ ] Implement rule evaluation against normalized scenario inputs.
- [ ] Compute due offsets and resolve due dates.
- [ ] Attach notes, links, and rationale metadata where available.
- [ ] Add deduplication for overlapping tasks.
- [ ] Add deterministic sorting rules before rendering.

## 4) Timeline Checklist Rendering (FR-4)

- [ ] Render one checklist item per generated task.
- [ ] Group tasks by required timeline buckets:
  1. Before Trip
  2. Arrival Day
  3. During Stay
  4. Departure
- [ ] Handle empty buckets gracefully.
- [ ] Support item state behavior (pending/completed/hidden) where implemented.

## 5) Calendar Handoff (FR-5)

- [ ] Implement `.ics` serialization and download.
- [ ] Implement Google event link generation per task.
- [ ] Add CTA actions for calendar handoff.
- [ ] Add UX copy clarifying reminders are managed in destination calendar apps.
- [ ] Validate event title/description format quality.

## 6) Country Pack and Content Quality (FR-6)

- [ ] Finalise `data/checklist-schema.json`.
- [ ] Populate `data/countries/vietnam.json` for core scenarios.
- [ ] Validate links/notes for trust and relevance.
- [ ] Add content versioning/change tracking approach.

## 7) UX States and Feedback

- [ ] Add loading/processing state during checklist generation.
- [ ] Add success state for checklist-ready flow.
- [ ] Add partial-results state for low-coverage scenarios.
- [ ] Add recoverable error state and next-step guidance.

## 8) Data Quality and Guardrails

- [ ] Add timezone-safe due-date computation checks.
- [ ] Validate short-trip and long-stay scenarios.
- [ ] Validate visa-required and visa-exempt scenarios.
- [ ] Add safeguards for missing/ambiguous scenario inputs.

## 9) QA and Acceptance Validation

- [ ] Run end-to-end happy-path test for Vietnam newcomer scenario.
- [ ] Test edge scenarios across trip length and purpose combinations.
- [ ] Test `.ics` import in Apple Calendar and a universal calendar client.
- [ ] Test Google event link flow across representative devices.
- [ ] Verify acceptance criteria from `PRD.md` section 11.

## 10) Launch Readiness (MVP)

- [ ] Confirm source/disclaimer copy for entry requirement trust.
- [ ] Instrument funnel analytics events:
  - [ ] wizard start
  - [ ] checklist generated
  - [ ] calendar exported
- [ ] Document known limitations and deferred items.
- [ ] Final pass: ensure no non-goal features were introduced.

## Definition of Done (MVP)

- [ ] User can complete intake form and receive a tailored checklist.
- [ ] Checklist is grouped correctly by timeline buckets.
- [ ] User can export tasks via `.ics`.
- [ ] User can open Google event links from checklist items.
- [ ] Timezone expectations are validated for due-date behavior.
- [ ] Vietnam starter journey is covered end-to-end.
