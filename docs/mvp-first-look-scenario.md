# MVP First-Look Benchmark Scenario

Use this scenario as the canonical demo path for first-look validation.

## Input Scenario

- destinationCountry: Vietnam
- departureCountry: Australia
- passportCountry: Australia
- arrivalDate: 2026-06-10
- departureDate: 2026-06-20
- purpose: tourism
- budgetLevel: midrange
- transportStyle: mixed
- groupType: solo

## Expected Output Shape

Each generated task should include:
- id
- category
- title
- description
- dueDate
- dueAtLocalIso
- bucket (Before Trip | Arrival Day | During Stay | Departure)
- priority
- links

## Demo Pass Conditions

- Checklist generates from this scenario without manual edits.
- Tasks appear in required bucket order.
- User can export `.ics` and open Google event links.
