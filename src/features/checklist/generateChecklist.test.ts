import { describe, expect, it } from "vitest";
import { generateChecklist } from "./generateChecklist";
import { FIRST_LOOK_SCENARIO } from "../../config/mvpFirstLook";

describe("generateChecklist", () => {
  it("creates Vietnam checklist from scenario", () => {
    const tasks = generateChecklist(FIRST_LOOK_SCENARIO);

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.some((task) => task.category === "visa")).toBe(true);
    expect(tasks.some((task) => task.bucket === "Departure")).toBe(true);
  });

  it("filters conditional transport tasks", () => {
    const publicOnly = generateChecklist({
      ...FIRST_LOOK_SCENARIO,
      transportStyle: "public",
    });

    expect(publicOnly.some((task) => task.id === "vn-grab-install")).toBe(false);
    expect(publicOnly.some((task) => task.id === "vn-public-transport")).toBe(true);
  });

  it("returns no tasks when departure is before arrival", () => {
    const invalid = generateChecklist({
      ...FIRST_LOOK_SCENARIO,
      arrivalDate: "2026-06-20",
      departureDate: "2026-06-10"
    });

    expect(invalid).toEqual([]);
  });
});
