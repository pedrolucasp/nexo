import {
  EDITING_WINDOW_MS,
  editingWindowAt,
} from "@/hooks/useEditingWindow";

const createdAt = new Date("2025-01-15T12:00:00.000Z");
const at = (offsetMs = 0) => createdAt.getTime() + offsetMs;

describe("editingWindowAt", () => {
  it("allows editing right after creation", () => {
    const result = editingWindowAt(createdAt, at());

    expect(result.canEdit).toBe(true);
    expect(result.minutesLeft).toBe(5);
    expect(result.countdown).toBe("5:00");
  });

  it("counts the remaining minutes down", () => {
    const result = editingWindowAt(createdAt, at(3 * 60 * 1000));

    expect(result.canEdit).toBe(true);
    expect(result.minutesLeft).toBe(2);
    expect(result.countdown).toBe("2:00");
  });

  it("shows the remaining seconds between minute marks", () => {
    const result = editingWindowAt(createdAt, at(90 * 1000));

    expect(result.canEdit).toBe(true);
    expect(result.countdown).toBe("3:30");
  });

  it("treats the exact boundary as expired", () => {
    const result = editingWindowAt(createdAt, at(EDITING_WINDOW_MS));

    expect(result.canEdit).toBe(false);
    expect(result.minutesLeft).toBe(0);
    expect(result.countdown).toBe("");
  });

  it("closes the window once the clock passes it", () => {
    const result = editingWindowAt(createdAt, at(6 * 60 * 1000));

    expect(result.canEdit).toBe(false);
  });

  it("accepts an ISO string as well as a Date", () => {
    expect(editingWindowAt(createdAt.toISOString(), at()).canEdit).toBe(true);
  });

  it("reports no editing when there is no creation timestamp", () => {
    const result = editingWindowAt(undefined, at());

    expect(result.canEdit).toBe(false);
    expect(result.countdown).toBe("");
  });
});
