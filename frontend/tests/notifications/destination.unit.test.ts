import { destination } from "@/lib/notifications/destination";
import type { Notification } from "@/lib/api";

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    kind: "MEDICINE_REMINDER",
    title: "Hora de tomar Sertralina",
    body: "50mg",
    scheduledFor: "2025-01-15T11:00:00.000Z",
    expiresAt: null,
    regimenId: 7,
    createdAt: "2025-01-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("destination", () => {
  it("opens today's medicines for a medicine reminder", () => {
    expect(destination(notification())).toEqual({
      pathname: "/care-actions/medicine",
    });
  });

  it("still opens today's medicines when the regimen is gone", () => {
    expect(destination(notification({ regimenId: null }))).toEqual({
      pathname: "/care-actions/medicine",
    });
  });

  it("opens a new mood entry for the daily reminder", () => {
    expect(destination(notification({ kind: "DAILY_REMINDER" }))).toEqual({
      pathname: "/new/entry",
    });
  });

  it("opens insights for an insight alert", () => {
    expect(destination(notification({ kind: "INSIGHT_ALERT" }))).toEqual({
      pathname: "/insights",
    });
  });
});
