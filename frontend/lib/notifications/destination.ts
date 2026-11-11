import type { Href } from "expo-router";
import type { Notification } from "@/lib/api";

// A medicine reminder is about taking a dose now, so it lands on the list that
// shows what is due today rather than on the regimen's editor
export function destination(notification: Notification): Href {
  if (notification.kind === "MEDICINE_REMINDER") {
    return { pathname: "/care-actions/medicine" } as Href;
  }

  if (notification.kind === "DAILY_REMINDER") {
    return { pathname: "/new/entry" } as Href;
  }

  return { pathname: "/insights" } as Href;
}
