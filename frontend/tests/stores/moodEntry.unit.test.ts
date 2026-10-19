import { useMoodEntryStore } from "@/stores";

const state = () => useMoodEntryStore.getState();
const component = (id: string, intensity: number) => ({ id, intensity });

beforeEach(() => {
  useMoodEntryStore.setState({ selectedMood: null, components: [] });
});

describe("setSelectedMood", () => {
  it("records the selected mood", () => {
    state().setSelectedMood("good");

    expect(state().selectedMood).toBe("good");
  });
});

describe("setComponents", () => {
  it("replaces the whole component list at once", () => {
    state().setComponents([component("joy", 3), component("calm", 2)]);

    expect(state().components).toStrictEqual([
      component("joy", 3),
      component("calm", 2),
    ]);
  });
});

describe("addComponent", () => {
  it("appends with the default intensity", () => {
    state().addComponent("joy");

    expect(state().components).toStrictEqual([component("joy", 1)]);
  });

  it("keeps the order the components were added in", () => {
    state().addComponent("joy");
    state().addComponent("calm");

    expect(state().components).toStrictEqual([
      component("joy", 1),
      component("calm", 1),
    ]);
  });

  it("ignores a re-add, keeping the intensity already set", () => {
    state().addComponent("joy");
    state().setComponentIntensity("joy", 3);

    state().addComponent("joy");

    expect(state().components).toStrictEqual([component("joy", 3)]);
  });
});

describe("removeComponent", () => {
  it("drops the component and leaves the rest", () => {
    state().setComponents([component("joy", 1), component("calm", 2)]);

    state().removeComponent("joy");

    expect(state().components).toStrictEqual([component("calm", 2)]);
  });
});

describe("setComponentIntensity", () => {
  it("changes only the target component", () => {
    state().setComponents([component("joy", 2), component("calm", 1)]);

    state().setComponentIntensity("calm", 3);

    expect(state().components).toStrictEqual([
      component("joy", 2),
      component("calm", 3),
    ]);
  });
});

describe("reset", () => {
  it("clears the mood and the component list", () => {
    state().setSelectedMood("good");
    state().addComponent("joy");

    state().reset();

    expect(state().selectedMood).toBeNull();
    expect(state().components).toStrictEqual([]);
  });
});
