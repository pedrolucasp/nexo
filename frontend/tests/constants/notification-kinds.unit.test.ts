import { NOTIFICATION_KINDS } from "@/constants/notification-kinds";

describe("NOTIFICATION_KINDS", () => {
  it("carries the icon and bubble for a daily reminder", () => {
    expect(NOTIFICATION_KINDS.DAILY_REMINDER).toStrictEqual({
      icon: "mood",
      color: "#0EA5E9",
      iconBackground: "#E0F2FE",
    });
  });

  it("carries the icon and bubble for a medicine reminder", () => {
    expect(NOTIFICATION_KINDS.MEDICINE_REMINDER).toStrictEqual({
      icon: "medication",
      color: "#7C3AED",
      iconBackground: "#EDE9FE",
    });
  });

  it("carries the icon and bubble for an insight alert", () => {
    expect(NOTIFICATION_KINDS.INSIGHT_ALERT).toStrictEqual({
      icon: "lightbulb-outline",
      color: "#D97706",
      iconBackground: "#FEF3C7",
    });
  });
});
