# PRD: Travel Checklist Planner

## 1) Overview

Travel Checklist Planner turns a traveler scenario into a personalized, timeline-based checklist and helps users move tasks into their calendar. The product is web-first for MVP and focused on practical trip readiness, not full reminder ownership.

## 2) Problem

Travelers often repeat the same research for each trip and still miss time-sensitive tasks. Generic advice is hard to convert into personal action plans, and reminder setup is fragmented.

## 3) Goals (MVP)

- Capture traveler scenario inputs through a guided form.
- Generate a personalized checklist using rule-based logic.
- Present tasks in timeline buckets for sequencing clarity.
- Support calendar handoff through `.ics` export and Google event links.
- Deliver a complete Vietnam starter journey.

## 4) Non-Goals (MVP)

- Full Google OAuth sync with event lifecycle management.
- Native push notification infrastructure.
- Account system, cloud sync, and cross-device trip persistence.

## 5) Target Users

- International travelers who want faster prep with less manual planning.
- Users who prefer practical checklists and calendar reminders over long-form guidance.

## 6) Core User Flow

1. User opens the app and completes traveler intake steps.
2. System validates and normalizes scenario inputs.
3. Rule engine builds due-dated checklist tasks.
4. UI shows tasks grouped by timeline bucket.
5. User exports to `.ics` or opens Google event links.
6. User manages reminder timing inside their calendar app.

## 7) Functional Requirements

### FR-1 Traveler Intake
- System provides a multi-step form for trip scenario capture.
- System validates required fields and input formats.
- System supports local save-progress behavior where available.

### FR-2 Scenario Normalization
- System transforms form inputs into canonical rule-engine fields.
- System applies defaults for missing optional values when safe.

### FR-3 Rule-Based Checklist Generation
- System evaluates task rules against normalized scenario data.
- System computes due-date offsets per matched task rule.
- System returns tasks with title, timeline bucket, due date, and optional guidance links/notes.

### FR-4 Timeline Checklist Rendering
- System renders tasks grouped by:
  1. Before Trip
  2. Arrival Day
  3. During Stay
  4. Departure
- System supports item state behavior (pending/completed/hidden where implemented).

### FR-5 Calendar Handoff
- System can export selected tasks as `.ics`.
- System can generate Google event creation links per task.
- System clearly communicates that reminders are managed in the destination calendar app.

### FR-6 Country Content Pack (MVP)
- System includes Vietnam content pack with task rules and references.
- Content schema supports future country-pack expansion.

## 8) UX Requirements

- Keep flow straightforward: form -> checklist -> export actions.
- Show clear processing, success, partial, and error states.
- Keep timeline grouping and action labels easy to scan.

## 9) Success Metrics

- User reaches checklist generation from form completion without drop-off spikes.
- User exports calendar handoff (`.ics` and/or Google links) at healthy conversion.
- Generated checklist quality is judged actionable for common Vietnam scenarios.

## 10) Assumptions and Risks

- Country requirements and travel policies can change, creating content staleness risk.
- Rule logic coverage may miss edge-case traveler profiles early on.
- Timezone handling errors can reduce user trust in reminder timing.

## 11) Acceptance Criteria (MVP)

- Given a valid traveler scenario, system produces a tailored checklist.
- Checklist renders in the required timeline buckets.
- User can export checklist tasks via `.ics`.
- User can open Google event links from checklist items.
- Calendar handoff behavior is reliable for timezone expectations.
- Vietnam starter journey is usable end-to-end.

## 12) Open Questions

- What confidence/coverage threshold defines "launch-ready" for country-pack quality?
- Should checklist item completion state persist only locally in MVP?
- Which analytics events are required before launch freeze?

## 13) Operational Context

### Current Baseline
- Product direction and phase sequencing are defined in `README.md`.
- Initial data model direction includes checklist schema and country pack files.

### Next Execution Slices
1. Finalise canonical task rule schema and form mapping docs.
2. Build wizard, generation engine, and grouped checklist views.
3. Implement `.ics` and Google link handoff features.
4. Add timezone validation, source disclaimers, analytics, and end-to-end QA.

### Roadmap

- See `ROADMAP.md` for stage-level progression and post-MVP expansion.
