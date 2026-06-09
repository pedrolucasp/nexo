export function rollingPeriod(days = 7) {
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - days);

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };
}
