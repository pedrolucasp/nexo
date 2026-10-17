import { tz } from "@date-fns/tz";
import { set } from "date-fns";

export const APP_TIMEZONE = tz("America/Sao_Paulo");

// The instant, on the app-timezone day containing `reference`, at "HH:MM"
export function appTimeToday(time: string, reference: Date = new Date()): Date {
  const [hours, minutes] = time.split(":").map(Number);

  return set(reference, { hours, minutes, seconds: 0, milliseconds: 0 }, {
    in: APP_TIMEZONE,
  });
}
