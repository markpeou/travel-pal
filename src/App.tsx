import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import type { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMemo, useState } from "react";
import { ChecklistView } from "./features/checklist/ChecklistView";
import { generateChecklist } from "./features/checklist/generateChecklist";
import { TravelWizard } from "./features/wizard/TravelWizard";
import { trackEvent } from "./lib/analytics";
import { ChecklistTask, TravelScenario } from "./types";

function parseIsoDateLocal(isoDate: string): Date {
  const [yearPart, monthPart, dayPart] = isoDate.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  return new Date(year, month - 1, day);
}

function getTripDurationDays(scenario: TravelScenario | null): number | undefined {
  if (!scenario) return undefined;
  const arrival = parseIsoDateLocal(scenario.arrivalDate);
  const departure = parseIsoDateLocal(scenario.departureDate);
  const diffMs = departure.getTime() - arrival.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return undefined;
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export default function App(): JSX.Element {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [scenario, setScenario] = useState<TravelScenario | null>(null);
  const [wizardOpen, setWizardOpen] = useState(true);
  const tasks: ChecklistTask[] = useMemo(() => (scenario ? generateChecklist(scenario) : []), [scenario]);
  const tripDurationDays = useMemo(() => getTripDurationDays(scenario), [scenario]);

  const handleDialogClose: NonNullable<DialogProps["onClose"]> = (_event, reason) => {
    if (scenario === null && (reason === "backdropClick" || reason === "escapeKeyDown")) {
      return;
    }
    setWizardOpen(false);
  };

  return (
    <main className="app-shell">
      <h1 className="app-title">🧳 Travel Checklist Planner</h1>
      <p className="app-lede">Build a personalized arrival checklist, then hand off reminders to your calendar.</p>
      {scenario !== null && (
        <Button variant="outlined" onClick={() => setWizardOpen(true)} sx={{ mb: 2 }}>
          Edit trip details
        </Button>
      )}
      <ChecklistView
        tasks={tasks}
        tripDurationDays={tripDurationDays}
        departureCountry={scenario?.departureCountry}
      />

      <Dialog open={wizardOpen} onClose={handleDialogClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
        <DialogTitle>Plan your trip</DialogTitle>
        <DialogContent dividers>
          <TravelWizard
            seedScenario={scenario}
            onSubmit={(nextScenario) => {
              setScenario(nextScenario);
              setWizardOpen(false);
              trackEvent("checklist_generated", { destination: nextScenario.destinationCountry });
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
