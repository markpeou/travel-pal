import { formatIcsDateTime } from "../../lib/datetime";
import { ChecklistTask } from "../../types";

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(tasks: ChecklistTask[]): string {
  const now = formatIcsDateTime(new Date());
  const events = tasks
    .map((task) => {
      const start = new Date(task.dueAtLocalIso);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return [
        "BEGIN:VEVENT",
        `UID:${task.id}@travel-pal`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatIcsDateTime(start)}`,
        `DTEND:${formatIcsDateTime(end)}`,
        `SUMMARY:${escapeIcs(task.title)}`,
        `DESCRIPTION:${escapeIcs(task.description)}`,
        "END:VEVENT"
      ].join("\n");
    })
    .join("\n");

  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TravelPal//Checklist//EN", events, "END:VCALENDAR"].join("\n");
}

export function downloadIcs(tasks: ChecklistTask[], fileName?: string): void {
  const resolvedFileName = fileName ?? `travel-checklist-${tasks[0]?.dueDate ?? "plan"}.ics`;
  const content = buildIcs(tasks);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = resolvedFileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
