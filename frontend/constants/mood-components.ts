export interface MoodComponentDefinition {
  id: string;
  label: string;
  color: string;
}

export const MOOD_COMPONENTS: MoodComponentDefinition[] = [
  { id: 'joy',       label: 'Alegria',       color: '#FBBF24' }, // amber
  { id: 'neutral',   label: 'Tranquilidade', color: '#60A5FA' }, // blue
  { id: 'anger',     label: 'Raiva',         color: '#F87171' }, // red
  { id: 'sadness',   label: 'Tristeza',      color: '#818CF8' }, // indigo
  { id: 'anxiety',   label: 'Ansiedade',     color: '#FB923C' }, // orange
  { id: 'gratitude', label: 'Gratidão',      color: '#C084FC' }, // purple
  { id: 'focus',     label: 'Foco',          color: '#34D399' }, // teal
  { id: 'tiredness', label: 'Cansaço',       color: '#94A3B8' }, // slate
];

// Lookup helper
export const getMoodComponent = (id: string) =>
  MOOD_COMPONENTS.find((c) => c.id === id);

// Intensity label buckets
export const intensityLabel = (value: number): string => {
  if (value <= 2) return 'Muito Baixa';
  if (value <= 4) return 'Baixa';
  if (value <= 6) return 'Moderada';
  if (value <= 8) return 'Alta';
  return 'Muito Alta';
};
