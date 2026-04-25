# MVP Form Mapping

## Form Inputs
- Destination country
- Departure country
- Passport country
- Arrival date
- Departure date
- Purpose
- Budget level
- Transport style
- Group type

## Mapping Rules
- Destination country picks the country task pack.
- Arrival/departure dates anchor each task offset.
- Purpose filters visa or documentation tasks when rules specify `purposeIn`.
- Budget filters cost-sensitive recommendations when rules specify `budgetLevelIn`.
- Transport style filters between ride-hailing and public transport setup tasks.
- Group type can be used later for family-specific additions.

## Timeline Buckets
- Before trip: due date before arrival date.
- Arrival day: due date on arrival date.
- During stay: due date between arrival and departure.
- Departure: due date on or near departure date.
