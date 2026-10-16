import { tz } from "@date-fns/tz";
import { addDays, parse, startOfDay, subDays } from "date-fns";

export function rollingPeriod(days = 7) {
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - days);

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };
}

const APP_TIMEZONE = tz("America/Sao_Paulo");

// pt-BR label for the app-timezone day window, kept beside the window helpers
// so the wording and the window it names live in one place
export const DAY_WINDOW_LABEL = "hoje";

// Start of the day containing `date`, in the app's timezone
export function startOfAppDay(date: Date = new Date()): Date {
  return startOfDay(date, { in: APP_TIMEZONE });
}

// Start of the app-timezone day immediately before the one containing `date`
export function previousAppDay(date: Date = new Date()): Date {
  return startOfDay(subDays(date, 1, { in: APP_TIMEZONE }), {
    in: APP_TIMEZONE,
  });
}

// Start of the app-timezone day named by a YYYY-MM-DD string
export function parseAppDay(day: string): Date {
  return parse(day, "yyyy-MM-dd", new Date(), { in: APP_TIMEZONE });
}

// The app-timezone day containing `date`, as a half-open [start, end) window
export function appDayWindow(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = startOfDay(date, { in: APP_TIMEZONE });
  const end = startOfDay(addDays(start, 1, { in: APP_TIMEZONE }), {
    in: APP_TIMEZONE,
  });

  return { start, end };
}

export function appDayPeriod(date: Date = new Date()): {
  periodStart: string;
  periodEnd: string;
} {
  const { start, end } = appDayWindow(date);

  return { periodStart: start.toISOString(), periodEnd: end.toISOString() };
}
