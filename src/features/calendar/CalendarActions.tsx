import { buildGoogleEventLink } from "./buildGoogleEventLink";
import { downloadIcs } from "./buildIcs";
import { ChecklistTask } from "../../types";
import { trackEvent } from "../../lib/analytics";

interface CalendarActionsProps {
  tasks: ChecklistTask[];
}

export function CalendarActions({ tasks }: CalendarActionsProps): JSX.Element {
  if (tasks.length === 0) return <p>Generate a checklist first to add events to your calendar.</p>;

  const reminderEligibleTasks = tasks.filter((task) => task.reminderEligible !== false);
  const firstLink = reminderEligibleTasks.length > 0 ? buildGoogleEventLink(reminderEligibleTasks[0]) : "";

  return (
    <section className="calendar-actions" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
      <h3>Set reminders in your calendar</h3>
      <p>Add reminders only for time-sensitive checklist items using your own calendar app.</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={reminderEligibleTasks.length === 0}
          onClick={() => {
            downloadIcs(reminderEligibleTasks);
            trackEvent("calendar_ics_exported", { taskCount: reminderEligibleTasks.length });
          }}
        >
          Download .ics (Apple/Any Calendar)
        </button>
        {reminderEligibleTasks.length > 0 && (
          <a href={firstLink} target="_blank" rel="noreferrer">
            Quick add first reminder in Google Calendar
          </a>
        )}
      </div>

      <h4>Google Calendar reminder links</h4>
      {reminderEligibleTasks.length === 0 ? (
        <p>No reminder-eligible tasks in this checklist.</p>
      ) : (
        <ul>
          {reminderEligibleTasks.map((task) => (
            <li key={task.id}>
              <a href={buildGoogleEventLink(task)} target="_blank" rel="noreferrer">
                Add reminder: {task.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
