# Roadmap: Travel Checklist Planner

High-level stages aligned with product planning. Execution-level implementation tasks live in `MVP_CHECKLIST.md`.

## Stage 1 - MVP Launch (Web-first)

**Audience:** Early users planning international trips.

**Features**

- Guided multi-step traveler intake form.
- Rule-based personalized checklist generation from scenario inputs.
- Timeline grouping:
  - Before Trip
  - Arrival Day
  - During Stay
  - Departure
- Calendar handoff:
  - `.ics` export for Apple Calendar and universal import
  - Google event creation link flow
- Country content pack v1: Vietnam.

**Quality bar**

- User can complete the flow in minutes and get a practical, scenario-specific checklist.
- Calendar handoff works reliably without in-app reminder infrastructure.
- Core Vietnam newcomer journey is covered end-to-end.

## Stage 2 - Reliability and Trust Foundations

- Strong timezone and date validation safeguards across short and long trips.
- Improved rule quality coverage across visa-required and visa-exempt scenarios.
- Clear source/disclaimer links for entry and travel requirements.
- Funnel analytics instrumentation:
  - wizard start
  - checklist generated
  - calendar exported

## Stage 3 - Growth Foundations

- Expand country packs beyond Vietnam using the same task rule schema.
- Improve checklist personalization quality through scenario signal tuning.
- Add stronger QA playbooks and acceptance automation for recurring releases.

## Stage 4 - Post-MVP Product Expansion

- Google OAuth calendar sync (create/update/delete via event IDs).
- Accounts, saved trips, and reminder preferences.
- Mobile app plus push notifications powered by shared reminder logic.

---

## Phase Mapping from Current Plan

- **Phase 0 (Week 1):** Foundation and content modeling.
- **Phase 1 (Week 2):** Guided form and checklist generation.
- **Phase 2 (Week 3):** Calendar handoff MVP.
- **Phase 3 (Week 4):** Polish, trust, and launch readiness.

## Related Docs

- `README.md`
- `PROJECT_CONTEXT.md`
- `PRD.md`
- `MVP_CHECKLIST.md`
