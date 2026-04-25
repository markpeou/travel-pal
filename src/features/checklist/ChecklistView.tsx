import { useEffect, useMemo, useState } from "react";
import { ChecklistTask } from "../../types";
import { buildGoogleEventLink } from "../calendar/buildGoogleEventLink";
import { downloadIcs } from "../calendar/buildIcs";

interface ChecklistViewProps {
  tasks: ChecklistTask[];
  tripDurationDays?: number;
  departureCountry?: string;
}

const bucketOrder: ChecklistTask["bucket"][] = ["Before Trip", "Arrival Day", "During Stay", "Departure"];
const CHECKLIST_STATE_KEY_PREFIX = "travel-pal:checklist-completed:";
const FX_CACHE_KEY_PREFIX = "travel-pal:fx-rate:usd:";
const FX_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const inMemoryFxCache: Record<string, { rate: number; expiresAt: number }> = {};

const countryToCurrency: Record<string, string> = {
  australia: "AUD",
  "new zealand": "NZD",
  "united states": "USD",
  usa: "USD",
  us: "USD",
  canada: "CAD",
  "united kingdom": "GBP",
  uk: "GBP",
  england: "GBP",
  vietnam: "VND",
  singapore: "SGD",
  thailand: "THB",
  india: "INR",
  japan: "JPY",
  "south korea": "KRW",
  korea: "KRW",
  indonesia: "IDR",
  malaysia: "MYR",
  philippines: "PHP",
  france: "EUR",
  germany: "EUR",
  italy: "EUR",
  spain: "EUR",
  portugal: "EUR",
  ireland: "EUR",
  netherlands: "EUR"
};

function withEmoji(text: string, emoji: string): string {
  return text.startsWith(emoji) ? text : `${emoji} ${text}`;
}

function getTaskTitleWithEmoji(task: ChecklistTask): string {
  const title = task.title;
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("neighbourhood") || normalizedTitle.includes("stay guidance")) {
    return withEmoji(title, "🏨");
  }
  if (normalizedTitle.includes("immigration documents")) {
    return withEmoji(title, "📄");
  }
  if (normalizedTitle.includes("paying for things")) {
    return withEmoji(title, "💵");
  }

  switch (task.category) {
    case "visa":
      return withEmoji(title, "🛂");
    case "immigration":
      return withEmoji(title, "🛬");
    case "connectivity":
      return withEmoji(title, "📶");
    case "money":
      return withEmoji(title, "💰");
    case "transport":
      return withEmoji(title, "🚕");
    case "weather":
      return withEmoji(title, "🌤️");
    case "stay":
      return withEmoji(title, "🏠");
    case "departure":
      return withEmoji(title, "✈️");
    default:
      return title;
  }
}

function isUsLocale(locale: string): boolean {
  return locale
    .split(/[-_]/)
    .some((part) => part.toUpperCase() === "US");
}

function formatSuggestedDueDate(isoDate: string): string {
  const [yearPart, monthPart, dayPart] = isoDate.split("-");
  if (!yearPart || !monthPart || !dayPart) {
    return isoDate;
  }

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return isoDate;
  }

  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  const paddedYear = String(year).padStart(4, "0");

  return isUsLocale(locale)
    ? `${paddedMonth}/${paddedDay}/${paddedYear}`
    : `${paddedDay}/${paddedMonth}/${paddedYear}`;
}

function hasExpandableDetails(task: ChecklistTask, isReminderEligible: boolean): boolean {
  const description = task.description.trim();
  return (
    isReminderEligible ||
    task.links.length > 0 ||
    description.length > 90 ||
    Boolean(task.esimProviders && task.esimProviders.length > 0) ||
    Boolean(task.rideShareApps && task.rideShareApps.length > 0) ||
    Boolean(task.fastTrackOptions && task.fastTrackOptions.length > 0)
  );
}

interface DescriptionContent {
  paragraphs: string[];
  points: string[];
}

function toDescriptionContent(description: string): DescriptionContent {
  const trimmed = description.trim();
  if (!trimmed) return { paragraphs: [], points: [] };

  const lines = trimmed
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  const points: string[] = [];

  lines.forEach((line) => {
    if (/^[-*•]\s+/.test(line)) {
      points.push(line.replace(/^[-*•]\s+/, "").trim());
      return;
    }
    paragraphs.push(line);
  });

  return { paragraphs, points };
}

function extractUsdAmount(rawPrice: string): number | null {
  const normalized = rawPrice.replace(/,/g, "");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}

function normalizeCountryName(country?: string): string {
  return (country ?? "").trim().toLowerCase();
}

function resolveCurrencyCode(departureCountry?: string): string {
  const normalized = normalizeCountryName(departureCountry);
  if (!normalized) return "USD";
  return countryToCurrency[normalized] ?? "USD";
}

function getCachedFxRate(currencyCode: string): number | null {
  if (currencyCode === "USD") return 1;

  const now = Date.now();
  const memoryEntry = inMemoryFxCache[currencyCode];
  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.rate;
  }

  const storageKey = `${FX_CACHE_KEY_PREFIX}${currencyCode}`;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { rate: number; expiresAt: number };
    if (parsed.expiresAt <= now || !Number.isFinite(parsed.rate) || parsed.rate <= 0) {
      localStorage.removeItem(storageKey);
      return null;
    }
    inMemoryFxCache[currencyCode] = parsed;
    return parsed.rate;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

function setCachedFxRate(currencyCode: string, rate: number): void {
  if (currencyCode === "USD") return;
  const payload = { rate, expiresAt: Date.now() + FX_CACHE_TTL_MS };
  inMemoryFxCache[currencyCode] = payload;
  localStorage.setItem(`${FX_CACHE_KEY_PREFIX}${currencyCode}`, JSON.stringify(payload));
}

function formatCurrencyPerDay(value: number, currencyCode: string): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2
  });
  return `${formatter.format(value)}/day`;
}

function buildEstimatedPriceLabel(
  providerName: string,
  estimatedPrice: string,
  tripDurationDays: number | undefined,
  currencyCode: string,
  rateUsdToCurrency: number
): string {
  if (!tripDurationDays || tripDurationDays < 1) {
    return estimatedPrice;
  }

  const amount = extractUsdAmount(estimatedPrice);
  if (amount === null) {
    return estimatedPrice;
  }

  const isHolafly = providerName.trim().toLowerCase() === "holafly";
  const discountedAmount = isHolafly ? amount * 0.95 : amount;
  const dailyInTargetCurrency = (discountedAmount * rateUsdToCurrency) / tripDurationDays;

  if (isHolafly) {
    return `${formatCurrencyPerDay(dailyInTargetCurrency, currencyCode)} (incl. 5% discount)`;
  }

  return formatCurrencyPerDay(dailyInTargetCurrency, currencyCode);
}

export function ChecklistView({ tasks, tripDurationDays, departureCountry }: ChecklistViewProps): JSX.Element {
  const preferredCurrencyCode = useMemo(() => resolveCurrencyCode(departureCountry), [departureCountry]);
  const [rateUsdToCurrency, setRateUsdToCurrency] = useState<number>(() => getCachedFxRate(preferredCurrencyCode) ?? 1);
  const [rateFetchFailed, setRateFetchFailed] = useState(false);

  const completedStorageKey = useMemo(() => {
    const ids = tasks
      .map((task) => task.id)
      .sort()
      .join("|");
    return `${CHECKLIST_STATE_KEY_PREFIX}${ids}`;
  }, [tasks]);
  const [completedById, setCompletedById] = useState<Record<string, boolean>>({});
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tasks.length === 0) {
      setCompletedById({});
      return;
    }
    const raw = localStorage.getItem(completedStorageKey);
    if (!raw) {
      setCompletedById({});
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      const scopedEntries = Object.entries(parsed).filter(([taskId]) => tasks.some((task) => task.id === taskId));
      setCompletedById(Object.fromEntries(scopedEntries));
    } catch {
      setCompletedById({});
    }
  }, [completedStorageKey, tasks]);

  useEffect(() => {
    if (tasks.length === 0) return;
    localStorage.setItem(completedStorageKey, JSON.stringify(completedById));
  }, [completedById, completedStorageKey, tasks.length]);

  useEffect(() => {
    let cancelled = false;

    const currencyCode = preferredCurrencyCode;
    const cachedRate = getCachedFxRate(currencyCode);
    if (cachedRate !== null) {
      setRateUsdToCurrency(cachedRate);
      setRateFetchFailed(false);
      return () => {
        cancelled = true;
      };
    }

    if (currencyCode === "USD") {
      setRateUsdToCurrency(1);
      setRateFetchFailed(false);
      return () => {
        cancelled = true;
      };
    }

    async function fetchRate(): Promise<void> {
      try {
        const response = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${encodeURIComponent(currencyCode)}`
        );
        if (!response.ok) {
          throw new Error(`FX request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { rates?: Record<string, unknown> };
        const nextRateRaw = payload.rates?.[currencyCode];
        const nextRate = typeof nextRateRaw === "number" ? nextRateRaw : Number.NaN;
        if (!Number.isFinite(nextRate) || nextRate <= 0) {
          throw new Error(`Missing FX rate for ${currencyCode}`);
        }

        setCachedFxRate(currencyCode, nextRate);
        if (!cancelled) {
          setRateUsdToCurrency(nextRate);
          setRateFetchFailed(false);
        }
      } catch {
        if (!cancelled) {
          setRateUsdToCurrency(1);
          setRateFetchFailed(true);
        }
      }
    }

    void fetchRate();
    return () => {
      cancelled = true;
    };
  }, [preferredCurrencyCode]);

  const effectiveCurrencyCode = rateFetchFailed ? "USD" : preferredCurrencyCode;
  const effectiveRate = rateFetchFailed ? 1 : rateUsdToCurrency;

  function toggleComplete(taskId: string): void {
    setCompletedById((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }

  function toggleExpanded(taskId: string): void {
    setExpandedById((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }

  function handleAppleReminderDownload(task: ChecklistTask): void {
    downloadIcs([task], `travel-reminder-${task.id}.ics`);
  }

  if (tasks.length === 0) {
    return <p className="checklist-empty">No checklist tasks yet. Complete the wizard to generate your plan.</p>;
  }

  return (
    <section className="checklist-section">
      <h3 className="checklist-heading">🗒️ Your trip checklist</h3>
      <div className="checklist-intro">
        <p className="checklist-intro__body">
          Things to handle before you go, when you arrive, during your stay, and before you leave—based on your trip
          details.
        </p>
        <p className="checklist-intro__hint">
          Check items off as you go. Open task details to add calendar reminders.
        </p>
      </div>
      {bucketOrder.map((bucket) => {
        const inBucket = tasks.filter((task) => task.bucket === bucket);
        return (
          <div key={bucket} className="checklist-bucket">
            <h4 className="checklist-bucket-title">{bucket}</h4>
            {inBucket.length === 0 ? (
              <p className="checklist-bucket-empty">No tasks in this bucket for your scenario.</p>
            ) : (
              <ul className="checklist-task-list">
                {inBucket.map((task) => {
                  const isCompleted = Boolean(completedById[task.id]);
                  const isReminderEligible = task.reminderEligible !== false;
                  const canExpand = hasExpandableDetails(task, isReminderEligible);
                  const isExpanded = canExpand ? Boolean(expandedById[task.id]) : false;
                  const detailsId = `checklist-details-${task.id}`;
                  const formattedDueDate = formatSuggestedDueDate(task.dueDate);
                  const descriptionContent = toDescriptionContent(task.description);
                  const hasEsimProviders = Boolean(task.esimProviders && task.esimProviders.length > 0);
                  const hasRideShareApps = Boolean(task.rideShareApps && task.rideShareApps.length > 0);
                  const hasFastTrackOptions = Boolean(task.fastTrackOptions && task.fastTrackOptions.length > 0);

                  return (
                    <li
                      key={task.id}
                      className={`checklist-task-item ${isCompleted ? "is-complete" : ""} ${isExpanded ? "is-expanded" : ""}`}
                    >
                      <button
                        type="button"
                        className="checklist-check-button"
                        aria-label={`Mark ${task.title} as ${isCompleted ? "not done" : "done"}`}
                        aria-pressed={isCompleted}
                        onClick={() => toggleComplete(task.id)}
                      >
                        <span className="checklist-check-icon" aria-hidden="true">
                          {isCompleted ? "✓" : ""}
                        </span>
                      </button>

                      <div className="checklist-content">
                        <button
                          type="button"
                          className={`checklist-content-button ${canExpand ? "is-expandable" : "is-static"}`}
                          onClick={canExpand ? () => toggleExpanded(task.id) : undefined}
                          aria-expanded={canExpand ? isExpanded : undefined}
                          aria-controls={canExpand ? detailsId : undefined}
                        >
                          <span className="checklist-main-line">
                            <strong className="checklist-task-title">{getTaskTitleWithEmoji(task)}</strong>
                            {!task.hideDueDate && (
                              <span className="checklist-task-badge">Suggested due date: {formattedDueDate}</span>
                            )}
                          </span>
                          {canExpand && (
                            <span className="checklist-expand-icon" aria-hidden="true">
                              {isExpanded ? "▴" : "▾"}
                            </span>
                          )}
                        </button>

                        {canExpand && (
                          <div
                            id={detailsId}
                            className={`checklist-details ${isExpanded ? "is-open" : ""}`}
                            hidden={!isExpanded}
                          >
                            {hasEsimProviders ? (
                              <>
                                <p className="checklist-details-text">{task.description}</p>
                                <div className="esim-provider-list" role="list" aria-label="eSIM providers">
                                  {task.esimProviders!.map((provider) => (
                                    <article key={provider.provider} className="esim-provider-card" role="listitem">
                                      <h5 className="esim-provider-name">
                                        {provider.url ? (
                                          <a href={provider.url} target="_blank" rel="noreferrer" className="esim-provider-link">
                                            {provider.provider}
                                          </a>
                                        ) : (
                                          provider.provider
                                        )}
                                      </h5>
                                      <dl className="esim-provider-meta">
                                        <div>
                                          <dt>Best for</dt>
                                          <dd>{provider.bestFor}</dd>
                                        </div>
                                        <div>
                                          <dt>Est. price</dt>
                                          <dd>
                                            {buildEstimatedPriceLabel(
                                              provider.provider,
                                              provider.estimatedPrice,
                                              tripDurationDays,
                                              effectiveCurrencyCode,
                                              effectiveRate
                                            )}
                                          </dd>
                                        </div>
                                        <div>
                                          <dt>Coverage</dt>
                                          <dd>{provider.coverage}</dd>
                                        </div>
                                        <div>
                                          <dt>Hotspot</dt>
                                          <dd>{provider.hotspotSupport}</dd>
                                        </div>
                                      </dl>
                                    </article>
                                  ))}
                                </div>
                              </>
                            ) : hasRideShareApps ? (
                              <>
                                <p className="checklist-details-text">{task.description}</p>
                                <div className="esim-provider-list" role="list" aria-label="Ride-share apps">
                                  {task.rideShareApps!.map((app) => (
                                    <article key={app.app} className="esim-provider-card" role="listitem">
                                      <h5 className="esim-provider-name">
                                        <a href={app.url} target="_blank" rel="noreferrer" className="checklist-link">
                                          {app.app}
                                        </a>
                                      </h5>
                                      <dl className="esim-provider-meta">
                                        <div>
                                          <dt>Best for</dt>
                                          <dd>{app.bestFor}</dd>
                                        </div>
                                        <div>
                                          <dt>Fleet type</dt>
                                          <dd>{app.fleetType}</dd>
                                        </div>
                                        <div>
                                          <dt>Payment</dt>
                                          <dd>{app.paymentOptions}</dd>
                                        </div>
                                        <div>
                                          <dt>Advantage</dt>
                                          <dd>{app.keyAdvantage}</dd>
                                        </div>
                                      </dl>
                                    </article>
                                  ))}
                                </div>
                              </>
                            ) : hasFastTrackOptions ? (
                              <>
                                <p className="checklist-details-text">{task.description}</p>
                                <div className="esim-provider-list" role="list" aria-label="Fast-track options">
                                  {task.fastTrackOptions!.map((option) => (
                                    <article key={option.platform} className="esim-provider-card" role="listitem">
                                      <h5 className="esim-provider-name">
                                        {option.url ? (
                                          <a href={option.url} target="_blank" rel="noreferrer" className="checklist-link">
                                            {option.platform}
                                          </a>
                                        ) : (
                                          option.platform
                                        )}
                                      </h5>
                                      <dl className="esim-provider-meta">
                                        <div>
                                          <dt>Best for</dt>
                                          <dd>{option.bestFor}</dd>
                                        </div>
                                        <div>
                                          <dt>Avg. price</dt>
                                          <dd>{option.avgPrice}</dd>
                                        </div>
                                        <div>
                                          <dt>Contact</dt>
                                          <dd>{option.contactMethod}</dd>
                                        </div>
                                        <div>
                                          <dt>Advantage</dt>
                                          <dd>{option.bestFor}</dd>
                                        </div>
                                      </dl>
                                    </article>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <>
                                {descriptionContent.paragraphs.map((paragraph, index) => (
                                  <p key={`${task.id}-paragraph-${index}`} className="checklist-details-text">
                                    {paragraph}
                                  </p>
                                ))}
                                {descriptionContent.points.length > 0 && (
                                  <ul className="checklist-details-list">
                                    {descriptionContent.points.map((point, index) => (
                                      <li
                                        key={`${task.id}-detail-${index}`}
                                        className={`checklist-details-item ${point.includes("|") ? "is-tabular" : ""}`}
                                      >
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </>
                            )}
                            {task.links.length > 0 && (
                              <ul className="checklist-links-list">
                                {task.links.map((link) => (
                                  <li key={link.url}>
                                    <a href={link.url} target="_blank" rel="noreferrer" className="checklist-link">
                                      {link.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {isReminderEligible && (
                              <div className="checklist-reminder-actions">
                                <a
                                  href={buildGoogleEventLink(task)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="checklist-link checklist-reminder-button"
                                >
                                  Add reminder in Google Calendar
                                </a>
                                <button
                                  type="button"
                                  className="checklist-reminder-button checklist-reminder-button--apple"
                                  onClick={() => handleAppleReminderDownload(task)}
                                >
                                  Add reminder in Apple Calendar
                                </button>
                              </div>
                            )}
                            <p className="checklist-details-meta">Priority: {task.priority}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
