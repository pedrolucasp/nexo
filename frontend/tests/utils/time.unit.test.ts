import {
  formatDate,
  formatMoment,
  getTimeBadge,
  parseDateOnly,
} from "@/lib/utils/time";

const at = (hour: number, minute = 0) => new Date(2025, 0, 15, hour, minute);

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2025, 0, 15, 10, 0, 0));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("getTimeBadge", () => {
  it.each([
    { clock: "00:00", date: at(0), expected: { label: "Madrugada", variant: "purple" } },
    { clock: "03:30", date: at(3, 30), expected: { label: "Madrugada", variant: "purple" } },
    { clock: "05:59", date: at(5, 59), expected: { label: "Madrugada", variant: "purple" } },
    { clock: "06:00", date: at(6), expected: { label: "Manhã", variant: "green" } },
    { clock: "11:59", date: at(11, 59), expected: { label: "Manhã", variant: "green" } },
    { clock: "12:00", date: at(12), expected: { label: "Tarde", variant: "orange" } },
    { clock: "17:59", date: at(17, 59), expected: { label: "Tarde", variant: "orange" } },
    { clock: "18:00", date: at(18), expected: { label: "Noite", variant: "blue" } },
    { clock: "23:59", date: at(23, 59), expected: { label: "Noite", variant: "blue" } },
  ])("badges $clock as $expected.label", ({ date, expected }) => {
    expect(getTimeBadge(date)).toStrictEqual(expected);
  });
});

describe("formatMoment", () => {
  it("labels a moment from earlier today", () => {
    expect(formatMoment(new Date(2025, 0, 15, 8, 30))).toBe("Hoje às 08h30");
  });

  it("labels today's first minute as today", () => {
    expect(formatMoment(new Date(2025, 0, 15, 0, 0))).toBe("Hoje às 00h00");
  });

  it("labels last night's final minute as yesterday", () => {
    expect(formatMoment(new Date(2025, 0, 14, 23, 59))).toBe("Ontem às 23h59");
  });

  it("labels an older moment with the day and month", () => {
    expect(formatMoment(new Date(2025, 0, 10, 8, 30))).toBe(
      "10 de jan às 08h30",
    );
  });
});

describe("formatDate", () => {
  it("names today with a short date", () => {
    expect(formatDate(new Date(2025, 0, 15))).toBe("Hoje, 15/01");
  });

  it("names yesterday with a short date", () => {
    expect(formatDate(new Date(2025, 0, 14, 23, 59))).toBe("Ontem, 14/01");
  });

  it("names an older date with the year", () => {
    expect(formatDate(new Date(2025, 0, 10))).toBe("10/01/2025");
  });
});

describe("parseDateOnly", () => {
  it("anchors a date-only string inside the day it names", () => {
    const parsed = parseDateOnly("2025-01-10T00:00:00.000Z");

    expect(parsed.toDateString()).toBe(new Date(2025, 0, 10).toDateString());
  });

  it("anchors at local noon so an offset cannot roll the day over", () => {
    expect(parseDateOnly("2025-01-10T00:00:00.000Z").getHours()).toBe(12);
  });

  it("accepts a Date", () => {
    const parsed = parseDateOnly(new Date(Date.UTC(2025, 0, 10)));

    expect(parsed.toDateString()).toBe(new Date(2025, 0, 10).toDateString());
  });
});
