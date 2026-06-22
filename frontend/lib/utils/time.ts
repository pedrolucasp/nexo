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

// When it's a raw date only field, it should output stuff like
// Hoje, 10/10
// Ontem, 09/10
// 09/10/26
export const formatDate = (date: Date): string => {
  if (isToday(date))     return `Hoje, ${format(date, "dd/MM")}`;
  if (isYesterday(date)) return `Ontem, ${format(date, "dd/MM")}`;

  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

// Parse a date-only string (YYYY-MM-DD or ISO UTC midnight) as local noon
// to prevent timezone offsets from shifting the calendar day
export const parseDateOnly = (dateStr: string | Date): Date => {
  const iso = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
  return new Date(`${iso.slice(0, 10)}T12:00:00`);
};
