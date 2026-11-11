import type { TodayMedicineEntry } from "@/lib/api";

const minutesOfTime = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesOfDate = (date: Date | string): number => {
  const value = new Date(date);
  return value.getHours() * 60 + value.getMinutes();
};

export function sortedTimes(scheduledAt: string[]): string[] {
  return [...scheduledAt].sort((a, b) => minutesOfTime(a) - minutesOfTime(b));
}

// Logs recorded before the slot existed say nothing about which time they
// fulfil, so the closest scheduled time to when the dose was taken stands in
function nearestTime(
  times: string[],
  takenAt: Date | string,
): string | undefined {
  const taken = minutesOfDate(takenAt);

  return times.reduce<string | undefined>((nearest, time) => {
    if (!nearest) return time;

    const distance = Math.abs(minutesOfTime(time) - taken);
    const nearestDistance = Math.abs(minutesOfTime(nearest) - taken);

    return distance < nearestDistance ? time : nearest;
  }, undefined);
}

export function confirmedIndexes(entry: TodayMedicineEntry): Set<number> {
  const times = sortedTimes(entry.regimen.scheduledAt);
  const confirmed = new Set<number>();

  for (const log of entry.logs) {
    const slot = log.scheduledSlot ?? nearestTime(times, log.takenAt);
    const index = slot ? times.indexOf(slot) : -1;

    if (index >= 0) confirmed.add(index);
  }

  return confirmed;
}
