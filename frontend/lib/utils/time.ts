import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TimeBadgeVariant = 'morning' | 'afternoon' | 'night' | 'latenight';

export const TIME_BADGES: Record<TimeBadgeVariant, { label: string; variant: string; }> = {
  morning:   { label: 'Manhã',     variant: "green" },
  afternoon: { label: 'Tarde',     variant: "orange" },
  night:     { label: 'Noite',     variant: "blue" },
  latenight: { label: 'Madrugada', variant: "purple" },
};

export const getTimeBadge = (date: Date) => {
  const h = date.getHours();
  if (h >= 6  && h < 12) return TIME_BADGES.morning;
  if (h >= 12 && h < 18) return TIME_BADGES.afternoon;
  if (h >= 18 && h < 24) return TIME_BADGES.night;
  return TIME_BADGES.latenight;
}

export const formatMoment = (date: Date): string => {
  if (isToday(date))     return `Hoje às ${format(date, "HH'h'mm")}`;
  if (isYesterday(date)) return `Ontem às ${format(date, "HH'h'mm")}`;
  return format(date, "d 'de' MMM 'às' HH'h'mm", { locale: ptBR });
}
