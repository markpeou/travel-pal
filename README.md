# Travel Checklist Planner

Travel Checklist Planner is a web-first product that helps travelers prepare for international trips through a guided form, a personalized checklist timeline, and calendar handoff for reminders.

This MVP focuses on reducing repeated travel advice by turning it into a reusable workflow users can complete in minutes.

## Product Goal

Ship a practical MVP that:
- captures a traveler scenario via a step-by-step form,
- generates a personalized checklist of pre-trip and in-country actions,
- lets users add tasks to their own calendar for reminder management.

## MVP Scope

### Included in MVP
- Web app first (mobile app later).
- Interactive multi-step traveler intake form.
- Rule-based checklist generation from user scenario.
- Timeline grouping:
  - Before Trip
  - Arrival Day
  - During Stay
  - Departure
- Calendar handoff:
  - `.ics` export (Apple Calendar + universal import)
  - Google event creation link flow
- Vietnam as the first country pack.

### Explicitly Out of Scope (for MVP)
- Full Google OAuth event sync (create/update/delete event IDs).
- Native push notification infrastructure.
- Account system and cloud sync.

## Current MVP User Flow

1. User completes travel scenario form.
2. App normalizes scenario inputs.
3. Rule engine generates checklist tasks with due-date offsets.
4. User reviews personalized checklist by timeline bucket.
5. User exports to `.ics` or opens Google event links.
6. User configures reminder timing inside Google/Apple Calendar.

## Roadmap

## Phase 0: Foundation and Content Modeling (Week 1)
- Define checklist domains:
  - visa
  - immigration arrival flow
  - eSIM/connectivity
  - money and payments
  - transport
  - weather/packing
  - neighborhoods/stay
  - departure process
- Define task rule schema (conditions, due offsets, links, notes).
- Create first country pack (Vietnam).

### Deliverables
- `data/checklist-schema.json`
- `data/countries/vietnam.json`
- `docs/mvp-form-mapping.md`

## Phase 1: Guided Form and Checklist Generation (Week 2)
- Build multi-step form for traveler scenario capture.
- Implement rule engine for personalized due-dated tasks.
- Build checklist UI grouped by timeline buckets.

### Deliverables
- `src/features/wizard/TravelWizard.tsx`
- `src/features/checklist/generateChecklist.ts`
- `src/features/checklist/ChecklistView.tsx`

## Phase 2: Calendar Handoff MVP (Week 3)
- Implement full checklist `.ics` export.
- Implement Google event-link creation per task.
- Add one-click CTA to add trip plan to calendar.

### Deliverables
- `src/features/calendar/buildIcs.ts`
- `src/features/calendar/buildGoogleEventLink.ts`
- `src/features/calendar/CalendarActions.tsx`

## Phase 3: Polish, Trust, and Launch Readiness (Week 4)
- Add timezone handling and date validation safeguards.
- Add official source links/disclaimers for entry requirements.
- Instrument analytics for funnel conversion.
- Run end-to-end scenario QA.

### Deliverables
- `src/lib/datetime.ts`
- `src/lib/analytics.ts`
- `docs/mvp-acceptance.md`

## Post-MVP Roadmap

### Phase 4
- Google OAuth full calendar sync (event IDs + updates).

### Phase 5
- Accounts + saved trips + reminder preferences.

### Phase 6
- Mobile app + push notifications powered by shared reminder logic.

## Checklist of Jobs by Phase

## Phase 0 Jobs
- [ ] Define canonical task categories and priorities.
- [ ] Define condition model (passport, purpose, budget, transport style, season).
- [ ] Build country content structure for JSON packs.
- [ ] Populate Vietnam starter tasks and links.
- [ ] Document form-to-task field mapping.

## Phase 1 Jobs
- [ ] Build stepper UX with field validation.
- [ ] Add save-progress behavior (local storage).
- [ ] Generate tasks from scenario + rules.
- [ ] Add checklist item state model (pending/completed/hidden).
- [ ] Render grouped checklist timeline views.

## Phase 2 Jobs
- [ ] Generate calendar event payloads from tasks.
- [ ] Implement `.ics` serialization and download.
- [ ] Define `.ics` filename/versioning strategy.
- [ ] Implement Google event URL encoding.
- [ ] Improve event title/description formatting and links.
- [ ] Add clear UX copy explaining calendar-managed reminders.

## Phase 3 Jobs
- [ ] Add timezone-safe due-date computation tests.
- [ ] Validate short-trip vs long-stay scenarios.
- [ ] Validate visa-required vs visa-exempt scenarios.
- [ ] Instrument funnel events:
  - wizard start
  - checklist generated
  - calendar exported
- [ ] Finalise MVP acceptance checklist and launch QA pass.

## Definition of Done (MVP)
- User can complete the form and receive a tailored checklist.
- User can export checklist tasks to calendar via `.ics`.
- User can open Google event links from checklist items.
- Event times are accurate for local timezone expectations.
- Vietnam newcomer journey is covered end-to-end.

## Suggested Next Step

After MVP launch, prioritize Phase 4 (Google OAuth sync) so users can update calendars without re-importing events.

## Development Security Notes

- Run dev and preview servers on localhost only.
- Avoid exposing dev ports to shared/untrusted networks.
- Current npm audit findings are primarily dev-tooling scoped (Vite/esbuild dev server chain).
- For MVP stability, prefer controlled upgrades over `npm audit fix --force`.
- Detailed status and upgrade track: `docs/vulnerability-reduction-status.md`.
