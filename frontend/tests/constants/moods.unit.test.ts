import { getMood } from "@/constants/moods";

describe("getMood", () => {
  it("finds a mood by its id", () => {
    expect(getMood("good")).toStrictEqual({
      id: "good",
      icon: "😊",
      label: "Bem",
    });
  });

  it("returns undefined for an unknown id", () => {
    expect(getMood("elated")).toBeUndefined();
  });
});
