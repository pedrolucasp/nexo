// TODO: Keep these synchronized with the API
export interface MoodDefinition {
  id: string;
  icon: string;
  label: string;
};

export const MOODS: MoodDefinition[] = [
  { id: 'sad', icon: '😢', label: 'Triste' },
  { id: 'neutral', icon: '😐', label: 'Neutro' },
  { id: 'good', icon: '😊', label: 'Bem' },
  { id: 'great', icon: '🤩', label: 'Ótimo' },
  { id: 'angry', icon: '😠', label: 'Irritado' },
];

// Lookup helper
export const getMood = (id: string) =>
  MOODS.find((c) => c.id === id);

