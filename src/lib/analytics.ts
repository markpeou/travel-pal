type EventPayload = Record<string, string | number | boolean>;

export function trackEvent(eventName: string, payload: EventPayload = {}): void {
  // Placeholder MVP analytics hook.
  // Replace with your provider (PostHog, Mixpanel, GA4) later.
  console.info("[analytics]", eventName, payload);
}
