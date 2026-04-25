# MVP Acceptance Checklist

## Functional
- [x] User completes a multi-step travel scenario form.
- [x] App generates a personalized checklist from country rules.
- [x] Checklist is grouped into timeline buckets.
- [x] User can export a full checklist as `.ics`.
- [x] User can open Google event links from checklist items.

## Date and Time Integrity
- [x] Date offsets are calculated from arrival/departure anchors.
- [x] Bucket classification is validated (Before Trip, Arrival Day, During Stay, Departure).
- [x] ICS output uses UTC timestamp format.

## Content and UX
- [x] Vietnam newcomer topics are covered: visa, immigration, eSIM, money, transport, weather, stay, departure.
- [x] Calendar handoff explains that reminder timing is controlled in native calendar apps.
- [x] Entry flow and export flow can be completed without account login.

## Validation
- [x] TypeScript build passes.
- [x] Unit tests pass for datetime and checklist generation logic.
