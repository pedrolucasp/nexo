import { tz } from "@date-fns/tz";
import { addDays, startOfDay } from "date-fns";

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

// Start of the day containing `date`, in the app's timezone
export function startOfAppDay(date: Date = new Date()): Date {
  return startOfDay(date, { in: APP_TIMEZONE });
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
