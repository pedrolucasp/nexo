import { useCareActionLinkStore } from "@/stores";

const TTL_MS = 30 * 60 * 1000;
const START = new Date(2025, 0, 15, 10, 0, 0);

const CLEARED = {
  pendingId: null,
  expiresAt: null,
  triggerLinked: false,
  moodLinked: false,
};

const SIDES = [
  {
    side: "trigger",
    link: "linkTrigger",
    otherLink: "linkMood",
    linkedFlag: "triggerLinked",
  },
  {
    side: "mood",
    link: "linkMood",
    otherLink: "linkTrigger",
    linkedFlag: "moodLinked",
  },
] as const;

const state = () => useCareActionLinkStore.getState();

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(START);
  useCareActionLinkStore.setState(CLEARED);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("setPending", () => {
  it("arms the expiry thirty minutes out and drops the linked sides", () => {
    useCareActionLinkStore.setState({ triggerLinked: true, moodLinked: true });

    state().setPending(42);

    expect(state().pendingId).toBe(42);
    expect(state().expiresAt).toBe(START.getTime() + TTL_MS);
    expect(state().triggerLinked).toBe(false);
    expect(state().moodLinked).toBe(false);
  });
});

describe.each(SIDES)(
  "linking the $side side",
  ({ link, otherLink, linkedFlag }) => {
    it("arms that side and hands back the pending id", () => {
      state().setPending(7);

      expect(state()[link]()).toBe(7);
      expect(state().pendingId).toBe(7);
      expect(state()[linkedFlag]).toBe(true);
    });

    it("clears the pending link once the other side links", () => {
      state().setPending(7);
      state()[link]();

      expect(state()[otherLink]()).toBe(7);
      expect(state()).toMatchObject(CLEARED);
    });

    it("refuses a repeat of its own side", () => {
      state().setPending(7);
      state()[link]();

      expect(state()[link]()).toBeNull();
      expect(state().pendingId).toBe(7);
      expect(state()[linkedFlag]).toBe(true);
    });

    it("still hands back the id at the exact expiry boundary", () => {
      state().setPending(9);
      jest.setSystemTime(START.getTime() + TTL_MS);

      expect(state()[link]()).toBe(9);
      expect(state()[linkedFlag]).toBe(true);
    });

    it("discards an expired pending action instead of handing it off", () => {
      state().setPending(9);
      jest.setSystemTime(START.getTime() + TTL_MS + 1);

      expect(state()[link]()).toBeNull();
      expect(state()).toMatchObject(CLEARED);
    });
  },
);

describe("with nothing pending", () => {
  it("hands back null for either side", () => {
    expect(state().linkTrigger()).toBeNull();
    expect(state().linkMood()).toBeNull();
  });
});

describe("clear", () => {
  it("resets every field", () => {
    state().setPending(3);
    useCareActionLinkStore.setState({ triggerLinked: true, moodLinked: true });

    state().clear();

    expect(state()).toMatchObject(CLEARED);
  });
});
