// TODO: Move other calculations here
export const avg = (values: number[]) =>
  values.reduce((a, b) => a + b, 0) / values.length;

export const formatHours = (hours: number): string => {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);

  // Rounding to the nearest minute can land on 60; carry it into the hour
  if (m === 60) {
    h += 1;
    m = 0;
  }

  if (m === 0) return `${h}h`;

  return `${h}h ${m}min`;
}

export const formatDiff = (minutes: number): string => {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = minutes > 0 ? "+" : "-";

  if (h === 0) return `${sign}${m}min`;
  if (m === 0) return `${sign}${h}h`;

  return `${sign}${h}h ${m}min`;
}
