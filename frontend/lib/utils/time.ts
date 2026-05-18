import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TimeBadgeVariant = 'morning' | 'afternoon' | 'night' | 'latenight';

export const TIME_BADGES: Record<TimeBadgeVariant, { label: string; backgroundColor: string; color: string }> = {
  morning:   { label: 'Manhã',     backgroundColor: '#dcfce7', color: '#16a34a' },
  afternoon: { label: 'Tarde',     backgroundColor: '#f1f5f9', color: '#475569' },
  night:     { label: 'Noite',     backgroundColor: '#dbeafe', color: '#1d4ed8' },
  latenight: { label: 'Madrugada', backgroundColor: '#f3e8ff', color: '#7e22ce' },
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
