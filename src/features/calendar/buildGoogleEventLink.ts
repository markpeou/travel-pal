import { ChecklistTask } from "../../types";

function formatGoogleDate(dateIso: string): string {
  return new Date(dateIso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildGoogleEventLink(task: ChecklistTask): string {
  const start = formatGoogleDate(task.dueAtLocalIso);
  const end = formatGoogleDate(new Date(new Date(task.dueAtLocalIso).getTime() + 60 * 60 * 1000).toISOString());
  const details = [task.description, ...task.links.map((link) => `${link.label}: ${link.url}`)].join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    dates: `${start}/${end}`,
    details
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
