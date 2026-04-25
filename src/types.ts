export type Purpose = "tourism" | "business" | "study" | "other";
export type BudgetLevel = "budget" | "midrange" | "premium";
export type TransportStyle = "public" | "ridehail" | "mixed";
export type GroupType = "solo" | "couple" | "family" | "friends";

export interface TravelScenario {
  destinationCountry: string;
  destinationCity: string;
  departureCountry: string;
  passportCountry: string;
  arrivalDate: string;
  departureDate: string;
  purpose: Purpose;
  budgetLevel: BudgetLevel;
  transportStyle: TransportStyle;
  groupType: GroupType;
}

export interface TaskRule {
  id: string;
  category: string;
  title: string;
  description: string;
  timing: {
    anchor: "arrival" | "departure";
    offsetDays: number;
    defaultHourLocal: number;
  };
  hideDueDate?: boolean;
  reminderEligible?: boolean;
  priority: "high" | "medium" | "low";
  links?: Array<{ label: string; url: string }>;
  esimProviders?: EsimProvider[];
  rideShareApps?: RideShareApp[];
  fastTrackOptions?: FastTrackOption[];
  conditions?: {
    purposeIn?: Purpose[];
    budgetLevelIn?: BudgetLevel[];
    transportStyleIn?: TransportStyle[];
    passportCountriesIn?: string[];
    passportCountriesNotIn?: string[];
  };
}

export interface EsimProvider {
  provider: string;
  url?: string;
  bestFor: string;
  estimatedPrice: string;
  coverage: string;
  hotspotSupport: string;
}

export interface ChecklistTask {
  id: string;
  category: string;
  title: string;
  description: string;
  dueDate: string;
  dueAtLocalIso: string;
  hideDueDate?: boolean;
  reminderEligible?: boolean;
  bucket: "Before Trip" | "Arrival Day" | "During Stay" | "Departure";
  priority: "high" | "medium" | "low";
  links: Array<{ label: string; url: string }>;
  esimProviders?: EsimProvider[];
  rideShareApps?: RideShareApp[];
  fastTrackOptions?: FastTrackOption[];
}

export interface RideShareApp {
  app: string;
  url: string;
  bestFor: string;
  fleetType: string;
  paymentOptions: string;
  keyAdvantage: string;
}

export interface FastTrackOption {
  platform: string;
  url?: string;
  avgPrice: string;
  contactMethod: string;
  bestFor: string;
}
