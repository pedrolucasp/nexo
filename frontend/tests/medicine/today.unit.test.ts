import { bucketOf, confirmedIndexes, dueToday, sortedTimes } from "@/lib/medicine/today";
import type { TodayMedicineEntry } from "@/lib/api";

function entry({
  regimen,
  logs = [],
}: {
  regimen?: Partial<TodayMedicineEntry["regimen"]>;
  logs?: TodayMedicineEntry["logs"];
} = {}): TodayMedicineEntry {
  return {
    regimen: {
      id: 1,
      name: "Sertralina",
      dosage: "50mg",
      periodicity: "DAILY",
      scheduledAt: ["08:00", "20:00"],
      ...regimen,
    },
    logs,
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
        regimen: { periodicity: "DAILY", scheduledAt: ["20:00", "08:00"] },
        logs: [{ id: 1, takenAt: at(20, 5), scheduledSlot: "20:00" }],
      }),
    );

    expect([...result]).toEqual([1]);
  });

  it("confirms nothing when the regimen has no times", () => {
    const result = confirmedIndexes(
      entry({
        regimen: { scheduledAt: [] },
        logs: [{ id: 1, takenAt: at(10) }],
      }),
    );

    expect([...result]).toEqual([]);
  });
});

describe("dueToday", () => {
  it("includes a daily regimen with scheduled times", () => {
    expect(dueToday(entry())).toBe(true);
  });

  it("leaves out a ONCE regimen, which logs itself when saved", () => {
    expect(
      dueToday(
        entry({
          regimen: {
            name: "Ibuprofeno",
            dosage: "400mg",
            periodicity: "ONCE",
            scheduledAt: [],
          },
        }),
      ),
    ).toBe(false);
  });

  it("leaves out a regimen with no scheduled times", () => {
    expect(
      dueToday(entry({ regimen: { scheduledAt: [] } })),
    ).toBe(false);
  });
});

describe("bucketOf", () => {
  it("is upcoming when every slot is still ahead", () => {
    expect(bucketOf(entry(), at(7))).toBe("upcoming");
  });

  it("is upcoming when the slot has just arrived", () => {
    expect(bucketOf(entry(), at(8))).toBe("upcoming");
  });

  it("is late once a slot has elapsed unticked", () => {
    expect(bucketOf(entry(), at(9))).toBe("late");
  });

  it("is late for an earlier slot left unticked after logging a later one", () => {
    const result = bucketOf(
      entry({ logs: [{ id: 1, takenAt: at(20, 5), scheduledSlot: "20:00" }] }),
      at(9),
    );

    expect(result).toBe("late");
  });

  it("is upcoming when the elapsed slot is done and the next one is ahead", () => {
    const result = bucketOf(
      entry({ logs: [{ id: 1, takenAt: at(8, 1), scheduledSlot: "08:00" }] }),
      at(9),
    );

    expect(result).toBe("upcoming");
  });

  it("is taken when every slot is logged", () => {
    const result = bucketOf(
      entry({
        logs: [
          { id: 1, takenAt: at(8, 1), scheduledSlot: "08:00" },
          { id: 2, takenAt: at(20, 1), scheduledSlot: "20:00" },
        ],
      }),
      at(21),
    );

    expect(result).toBe("taken");
  });
});
