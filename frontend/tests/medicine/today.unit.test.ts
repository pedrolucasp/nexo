import { confirmedIndexes, sortedTimes } from "@/lib/medicine/today";
import type { TodayMedicineEntry } from "@/lib/api";

function entry(overrides: Partial<TodayMedicineEntry> = {}): TodayMedicineEntry {
  return {
    regimen: {
      id: 1,
      name: "Sertralina",
      dosage: "50mg",
      scheduledAt: ["08:00", "20:00"],
    },
    logs: [],
    ...overrides,
  };
}

const at = (hours: number, minutes = 0) => new Date(2025, 0, 15, hours, minutes);

describe("sortedTimes", () => {
  it("orders the schedule by time of day", () => {
    expect(sortedTimes(["20:00", "08:00", "12:30"])).toEqual([
      "08:00",
      "12:30",
      "20:00",
    ]);
  });
});

describe("confirmedIndexes", () => {
  it("confirms nothing without logs", () => {
    expect([...confirmedIndexes(entry())]).toEqual([]);
  });

  it("confirms the slot the log says it fulfils", () => {
    const result = confirmedIndexes(
      entry({ logs: [{ id: 1, takenAt: at(20, 5), scheduledSlot: "20:00" }] }),
    );

    expect([...result]).toEqual([1]);
  });

  it("leaves the earlier slots pending when a dose is logged out of order", () => {
    const result = confirmedIndexes(
      entry({ logs: [{ id: 1, takenAt: at(20, 5), scheduledSlot: "20:00" }] }),
    );

    expect(result.has(0)).toBe(false);
  });

  it("confirms each fulfilled slot once", () => {
    const result = confirmedIndexes(
      entry({
        logs: [
          { id: 1, takenAt: at(8, 1), scheduledSlot: "08:00" },
          { id: 2, takenAt: at(20, 2), scheduledSlot: "20:00" },
          { id: 3, takenAt: at(20, 30), scheduledSlot: "20:00" },
        ],
      }),
    );

    expect([...result]).toEqual([0, 1]);
  });

  it("derives the slot from the taken time for a log without one", () => {
    const result = confirmedIndexes(
      entry({ logs: [{ id: 1, takenAt: at(20, 5) }] }),
    );

    expect([...result]).toEqual([1]);
  });

  it("points a legacy log at the closest scheduled time", () => {
    const result = confirmedIndexes(
      entry({ logs: [{ id: 1, takenAt: at(8, 10) }] }),
    );

    expect([...result]).toEqual([0]);
  });

  it("ignores a slot that is no longer on the schedule", () => {
    const result = confirmedIndexes(
      entry({ logs: [{ id: 1, takenAt: at(12), scheduledSlot: "12:00" }] }),
    );

    expect([...result]).toEqual([]);
  });

  it("uses the sorted order for a schedule filled out of order", () => {
    const result = confirmedIndexes(
      entry({
        regimen: {
          id: 1,
          name: "Sertralina",
          dosage: "50mg",
          scheduledAt: ["20:00", "08:00"],
        },
        logs: [{ id: 1, takenAt: at(20, 5), scheduledSlot: "20:00" }],
      }),
    );

    expect([...result]).toEqual([1]);
  });

  it("confirms nothing when the regimen has no times", () => {
    const result = confirmedIndexes(
      entry({
        regimen: { id: 1, name: "Sertralina", dosage: "50mg", scheduledAt: [] },
        logs: [{ id: 1, takenAt: at(10) }],
      }),
    );

    expect([...result]).toEqual([]);
  });
});
