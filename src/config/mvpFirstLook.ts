import { TravelScenario } from "../types";

export const FIRST_LOOK_SCENARIO: TravelScenario = {
  destinationCountry: "Vietnam",
  destinationCity: "Ho Chi Minh City, Vietnam",
  departureCountry: "Australia",
  passportCountry: "Australia",
  arrivalDate: "2026-06-10",
  departureDate: "2026-06-20",
  purpose: "tourism",
  budgetLevel: "midrange",
  transportStyle: "mixed",
  groupType: "solo"
};

export const REQUIRED_SCENARIO_FIELDS: Array<keyof TravelScenario> = [
  "destinationCountry",
  "destinationCity",
  "departureCountry",
  "passportCountry",
  "arrivalDate",
  "departureDate",
  "purpose",
  "budgetLevel",
  "transportStyle",
  "groupType"
];

export const FIRST_LOOK_STORAGE_KEY = "travel-pal:first-look-scenario";
