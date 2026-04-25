export function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function addDays(baseDate: Date, offsetDays: number): Date {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + offsetDays);
  return next;
}

export function withHourLocal(baseDate: Date, hour: number): Date {
  const next = new Date(baseDate);
  next.setHours(hour, 0, 0, 0);
  return next;
}

export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

export function classifyBucket(due: Date, arrival: Date, departure: Date): "Before Trip" | "Arrival Day" | "During Stay" | "Departure" {
  const dueDay = toDateOnly(due);
  const arrivalDay = toDateOnly(arrival);
  const departureDay = toDateOnly(departure);
  const departureWindowStart = addDays(departure, -1);

  if (dueDay === departureDay || due > departure || due >= departureWindowStart) {
    return "Departure";
  }
  if (dueDay === arrivalDay) {
    return "Arrival Day";
  }
  if (due < arrival) {
    return "Before Trip";
  }
  return "During Stay";
}

export function formatIcsDateTime(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getUTCDate()}`.padStart(2, "0");
  const hh = `${date.getUTCHours()}`.padStart(2, "0");
  const min = `${date.getUTCMinutes()}`.padStart(2, "0");
  const sec = `${date.getUTCSeconds()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${min}${sec}Z`;
}
