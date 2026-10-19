import { getTriggerCategory } from "@/constants/trigger-categories";

describe("getTriggerCategory", () => {
  it("finds a category by its id", () => {
    expect(getTriggerCategory("WORK")).toStrictEqual({
      id: "WORK",
      label: "Trabalho",
      icon: "work",
      color: "#3b82f6",
      iconBackground: "#dbeafe",
      variant: "blue",
    });
  });

  it("falls back to the catch-all category for an unknown id", () => {
    expect(getTriggerCategory("UNKNOWN")).toStrictEqual({
      id: "OTHER",
      label: "Outro",
      icon: "help-outline",
      color: "#94a3b8",
      iconBackground: "#f1f5f9",
      variant: "gray",
    });
  });
});
