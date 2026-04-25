import vietnamData from "../../../data/countries/vietnam.json";
import { addDays, classifyBucket, parseIsoDate, toDateOnly, withHourLocal } from "../../lib/datetime";
import { ChecklistTask, TaskRule, TravelScenario } from "../../types";

interface CountryPack {
  country: string;
  tasks: TaskRule[];
}

const countryPacks: Record<string, CountryPack> = {
  vietnam: vietnamData as CountryPack
};

function normalizeScenario(scenario: TravelScenario): TravelScenario {
  return {
    ...scenario,
    destinationCountry: scenario.destinationCountry.trim(),
    destinationCity: scenario.destinationCity.trim(),
    departureCountry: scenario.departureCountry.trim(),
    passportCountry: scenario.passportCountry.trim()
  };
}

function isValidScenario(scenario: TravelScenario): boolean {
  if (!scenario.destinationCountry || !scenario.arrivalDate || !scenario.departureDate) return false;
  const arrival = parseIsoDate(scenario.arrivalDate);
  const departure = parseIsoDate(scenario.departureDate);
  if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) return false;
  return departure > arrival;
}

function matchesConditions(rule: TaskRule, scenario: TravelScenario): boolean {
  const conditions = rule.conditions;
  if (!conditions) return true;
  if (conditions.purposeIn && !conditions.purposeIn.includes(scenario.purpose)) return false;
  if (conditions.budgetLevelIn && !conditions.budgetLevelIn.includes(scenario.budgetLevel)) return false;
  if (conditions.transportStyleIn && !conditions.transportStyleIn.includes(scenario.transportStyle)) return false;
  if (conditions.passportCountriesIn && !conditions.passportCountriesIn.includes(scenario.passportCountry)) return false;
  if (conditions.passportCountriesNotIn && conditions.passportCountriesNotIn.includes(scenario.passportCountry)) return false;
  return true;
}

function getAnchorDate(rule: TaskRule, scenario: TravelScenario): Date {
  return parseIsoDate(rule.timing.anchor === "arrival" ? scenario.arrivalDate : scenario.departureDate);
}

export function generateChecklist(scenario: TravelScenario): ChecklistTask[] {
  const normalized = normalizeScenario(scenario);
  if (!isValidScenario(normalized)) return [];

  const key = normalized.destinationCountry.toLowerCase();
  const pack = countryPacks[key];
  if (!pack) return [];

  const arrival = parseIsoDate(normalized.arrivalDate);
  const departure = parseIsoDate(normalized.departureDate);

  return pack.tasks
    .filter((rule) => matchesConditions(rule, normalized))
    .map((rule) => {
      const anchor = getAnchorDate(rule, normalized);
      const date = withHourLocal(addDays(anchor, rule.timing.offsetDays), rule.timing.defaultHourLocal);
      return {
        id: rule.id,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        dueDate: toDateOnly(date),
        dueAtLocalIso: date.toISOString(),
        hideDueDate: rule.hideDueDate,
        reminderEligible: rule.reminderEligible,
        bucket: classifyBucket(date, arrival, departure),
        priority: rule.priority,
        links: rule.links ?? [],
        esimProviders: rule.esimProviders,
        rideShareApps: rule.rideShareApps,
        fastTrackOptions: rule.fastTrackOptions
      };
    })
    .sort((a, b) => a.dueAtLocalIso.localeCompare(b.dueAtLocalIso));
}
