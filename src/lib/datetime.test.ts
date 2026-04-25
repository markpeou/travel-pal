import { describe, expect, it } from "vitest";
import { addDays, classifyBucket, formatIcsDateTime, parseIsoDate, toDateOnly, withHourLocal } from "./datetime";

describe("datetime utilities", () => {
  it("adds day offsets correctly", () => {
    const base = parseIsoDate("2026-05-10");
    expect(toDateOnly(addDays(base, -5))).toBe("2026-05-05");
    expect(toDateOnly(addDays(base, 2))).toBe("2026-05-12");
  });

  it("classifies timeline buckets", () => {
    const arrival = parseIsoDate("2026-05-10");
    const departure = parseIsoDate("2026-05-20");
    expect(classifyBucket(parseIsoDate("2026-05-05"), arrival, departure)).toBe("Before Trip");
    expect(classifyBucket(parseIsoDate("2026-05-10"), arrival, departure)).toBe("Arrival Day");
    expect(classifyBucket(parseIsoDate("2026-05-15"), arrival, departure)).toBe("During Stay");
    expect(classifyBucket(parseIsoDate("2026-05-20"), arrival, departure)).toBe("Departure");
  });

  it("sets local hour and formats ICS date", () => {
    const date = withHourLocal(parseIsoDate("2026-05-10"), 9);
    expect(date.getHours()).toBe(9);
    expect(formatIcsDateTime(date)).toMatch(/^\d{8}T\d{6}Z$/);
  });
});
