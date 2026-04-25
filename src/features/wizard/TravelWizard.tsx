import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FIRST_LOOK_SCENARIO, FIRST_LOOK_STORAGE_KEY } from "../../config/mvpFirstLook";
import { TravelScenario } from "../../types";
import { WizardReviewSummary } from "./WizardReviewSummary";

interface TravelWizardProps {
  onSubmit: (scenario: TravelScenario) => void;
  seedScenario?: TravelScenario | null;
}

const defaultScenario: TravelScenario = FIRST_LOOK_SCENARIO;
const vietnamCityOptions = ["Ho Chi Minh City, Vietnam"] as const;

function parseSavedScenario(): TravelScenario | null {
  const raw = localStorage.getItem(FIRST_LOOK_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TravelScenario;
  } catch {
    return null;
  }
}

function initialScenario(seed: TravelScenario | null | undefined): TravelScenario {
  if (seed) return { ...seed };
  return parseSavedScenario() ?? defaultScenario;
}

export function TravelWizard({ onSubmit, seedScenario }: TravelWizardProps): JSX.Element {
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState<TravelScenario>(() => initialScenario(seedScenario ?? undefined));
  const [stepError, setStepError] = useState<string | null>(null);

  const steps = useMemo(
    () => ["Trip Basics", "Entry Profile", "Travel Preferences", "Review"] as const,
    []
  );

  useEffect(() => {
    localStorage.setItem(FIRST_LOOK_STORAGE_KEY, JSON.stringify(scenario));
  }, [scenario]);

  useEffect(() => {
    if (seedScenario != null) {
      setScenario({ ...seedScenario });
      setStep(0);
      setStepError(null);
    }
  }, [seedScenario]);

  function updateField<K extends keyof TravelScenario>(field: K, value: TravelScenario[K]): void {
    setScenario((prev) => ({ ...prev, [field]: value }));
    setStepError(null);
  }

  function validateStep(): string | null {
    const isVietnamDestination = scenario.destinationCountry.trim().toLowerCase() === "vietnam";
    if (step === 0) {
      if (!scenario.destinationCountry || !scenario.arrivalDate || !scenario.departureDate) {
        return "Destination, arrival date, and departure date are required.";
      }
      if (isVietnamDestination && !scenario.destinationCity.trim()) {
        return "Please choose a city in Vietnam for your trip guidance.";
      }
      if (new Date(scenario.departureDate) <= new Date(scenario.arrivalDate)) {
        return "Departure date must be after arrival date.";
      }
    }
    if (step === 1) {
      if (!scenario.departureCountry || !scenario.passportCountry) {
        return "Departure country and passport country are required.";
      }
    }
    return null;
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setStepError(validationError);
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }
    setStepError(null);
    onSubmit(scenario);
  }

  const progress = ((step + 1) / steps.length) * 100;
  const isVietnamDestination = scenario.destinationCountry.trim().toLowerCase() === "vietnam";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block" }}>
            Step {step + 1} of {steps.length}
          </Typography>
          <Typography variant="h6" component="h2">
            {steps[step]}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.5, borderRadius: 1, height: 4 }} />
        </Box>

        {stepError && (
          <Alert severity="error" role="alert">
            {stepError}
          </Alert>
        )}

        {step === 0 && (
          <Stack spacing={2}>
            <TextField
              required
              label="Destination country"
              value={scenario.destinationCountry}
              onChange={(e) => updateField("destinationCountry", e.target.value)}
              fullWidth
              autoComplete="country-name"
            />
            {isVietnamDestination && (
              <FormControl fullWidth>
                <InputLabel id="destination-city-label">City in Vietnam</InputLabel>
                <Select
                  labelId="destination-city-label"
                  label="City in Vietnam"
                  value={scenario.destinationCity}
                  onChange={(e) => updateField("destinationCity", e.target.value)}
                >
                  {vietnamCityOptions.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              required
              label="Arrival date"
              type="date"
              value={scenario.arrivalDate}
              onChange={(e) => updateField("arrivalDate", e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              required
              label="Departure date"
              type="date"
              value={scenario.departureDate}
              onChange={(e) => updateField("departureDate", e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <TextField
              required
              label="Current departure country"
              value={scenario.departureCountry}
              onChange={(e) => updateField("departureCountry", e.target.value)}
              fullWidth
              autoComplete="country-name"
            />
            <TextField
              required
              label="Passport country"
              value={scenario.passportCountry}
              onChange={(e) => updateField("passportCountry", e.target.value)}
              fullWidth
              autoComplete="country-name"
            />
            <FormControl fullWidth>
              <InputLabel id="purpose-label">Purpose</InputLabel>
              <Select
                labelId="purpose-label"
                label="Purpose"
                value={scenario.purpose}
                onChange={(e) => updateField("purpose", e.target.value as TravelScenario["purpose"])}
              >
                <MenuItem value="tourism">Tourism</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="study">Study</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="budget-label">Budget level</InputLabel>
              <Select
                labelId="budget-label"
                label="Budget level"
                value={scenario.budgetLevel}
                onChange={(e) => updateField("budgetLevel", e.target.value as TravelScenario["budgetLevel"])}
              >
                <MenuItem value="budget">Budget</MenuItem>
                <MenuItem value="midrange">Midrange</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="transport-label">Transport style</InputLabel>
              <Select
                labelId="transport-label"
                label="Transport style"
                value={scenario.transportStyle}
                onChange={(e) => updateField("transportStyle", e.target.value as TravelScenario["transportStyle"])}
              >
                <MenuItem value="public">Public transport</MenuItem>
                <MenuItem value="ridehail">Ride-hail</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="group-label">Group type</InputLabel>
              <Select
                labelId="group-label"
                label="Group type"
                value={scenario.groupType}
                onChange={(e) => updateField("groupType", e.target.value as TravelScenario["groupType"])}
              >
                <MenuItem value="solo">Solo</MenuItem>
                <MenuItem value="couple">Couple</MenuItem>
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="friends">Friends</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}

        {step === 3 && <WizardReviewSummary scenario={scenario} />}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          useFlexGap
          sx={{ pt: 1, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
        >
          <Button type="button" variant="text" onClick={() => setStep((prev) => Math.max(0, prev - 1))} disabled={step === 0}>
            Back
          </Button>
          <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setScenario(defaultScenario);
                setStep(0);
                setStepError(null);
              }}
            >
              Reset to Demo Scenario
            </Button>
            <Button type="submit" variant="contained">
              {step === steps.length - 1 ? "Generate Checklist" : "Next"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </form>
  );
}
