import {
  getMoodComponent,
  intensityLabel,
  intensityToValue,
} from "@/constants/mood-components";

describe("getMoodComponent", () => {
  it("finds a component by its id", () => {
    expect(getMoodComponent("joy")).toStrictEqual({
      id: "joy",
      label: "Alegria",
      color: "#FBBF24",
    });
  });

  it("returns undefined for an unknown id", () => {
    expect(getMoodComponent("ennui")).toBeUndefined();
  });
});

describe("intensityLabel", () => {
  it.each([
    { value: 1, label: "Suave" },
    { value: 2, label: "Moderada" },
    { value: 3, label: "Intensa" },
  ])("labels the numeric intensity $value", ({ value, label }) => {
    expect(intensityLabel(value)).toBe(label);
  });

  it.each([
    { value: "LIGHT", label: "Suave" },
    { value: "MODERATE", label: "Moderada" },
    { value: "HIGH", label: "Intensa" },
  ])("labels the string intensity $value", ({ value, label }) => {
    expect(intensityLabel(value)).toBe(label);
  });
});

describe("intensityToValue", () => {
  it.each([
    { value: 1, expected: "LIGHT" },
    { value: 2, expected: "MODERATE" },
    { value: 3, expected: "HIGH" },
  ])("maps the numeric intensity $value", ({ value, expected }) => {
    expect(intensityToValue(value)).toBe(expected);
  });

  it("round-trips every value back to its label", () => {
    for (const value of [1, 2, 3]) {
      expect(intensityLabel(intensityToValue(value))).toBe(
        intensityLabel(value),
      );
    }
  });
});
