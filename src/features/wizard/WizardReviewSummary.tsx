import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { BudgetLevel, GroupType, Purpose, TransportStyle, TravelScenario } from "../../types";

function formatIsoDateLocal(iso: string): string {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { dateStyle: "medium" });
}

const purposeLabels: Record<Purpose, string> = {
  tourism: "Tourism",
  business: "Business",
  study: "Study",
  other: "Other"
};

const budgetLabels: Record<BudgetLevel, string> = {
  budget: "Budget",
  midrange: "Midrange",
  premium: "Premium"
};

const transportLabels: Record<TransportStyle, string> = {
  public: "Public transport",
  ridehail: "Ride-hail",
  mixed: "Mixed"
};

const groupLabels: Record<GroupType, string> = {
  solo: "Solo",
  couple: "Couple",
  family: "Family",
  friends: "Friends"
};

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
      <Typography component="span" variant="body2" color="text.secondary" sx={{ minWidth: "40%" }}>
        {label}
      </Typography>
      <Typography component="span" variant="body1" sx={{ textAlign: "right", flex: 1 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        p: 2,
        borderColor: "divider",
        borderRadius: 2
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {title}
      </Typography>
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {children}
      </Stack>
    </Paper>
  );
}

interface WizardReviewSummaryProps {
  scenario: TravelScenario;
}

export function WizardReviewSummary({ scenario }: WizardReviewSummaryProps): JSX.Element {
  return (
    <Stack spacing={2}>
      <Group title="Trip basics">
        <Row label="Destination" value={scenario.destinationCountry} />
        <Row label="City" value={scenario.destinationCity || "Not selected"} />
        <Row label="Arrival" value={formatIsoDateLocal(scenario.arrivalDate)} />
        <Row label="Departure" value={formatIsoDateLocal(scenario.departureDate)} />
      </Group>
      <Group title="Entry profile">
        <Row label="Departure country" value={scenario.departureCountry} />
        <Row label="Passport country" value={scenario.passportCountry} />
        <Row label="Purpose" value={purposeLabels[scenario.purpose]} />
      </Group>
      <Group title="Travel preferences">
        <Row label="Budget" value={budgetLabels[scenario.budgetLevel]} />
        <Row label="Transport" value={transportLabels[scenario.transportStyle]} />
        <Row label="Group" value={groupLabels[scenario.groupType]} />
      </Group>
    </Stack>
  );
}
