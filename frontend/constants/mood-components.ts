export interface MoodComponentDefinition {
  id: string;
  label: string;
  color: string;
}

export const MOOD_COMPONENTS: MoodComponentDefinition[] = [
  { id: "joy", label: "Alegria", color: "#FBBF24" }, // amber
  { id: "anger", label: "Raiva", color: "#F87171" }, // red
  { id: "sadness", label: "Tristeza", color: "#818CF8" }, // indigo
  { id: "fear", label: "Medo", color: "#F9A8D4" }, // pink
  { id: "guilt", label: "Culpa", color: "#FF6347" }, // tomato
  { id: "frustration", label: "Frustração", color: "#CD853F" }, // terracota
  // States
  { id: "calm", label: "Calmo", color: "#60A5FA" }, // blue
  { id: "motivated", label: "Motivado", color: "#FB923C" }, // orange
  { id: "tiredness", label: "Cansaço", color: "#94A3B8" }, // slate
  { id: "gratitude", label: "Gratidão", color: "#C084FC" }, // purple
  { id: "focus", label: "Foco", color: "#34D399" }, // teal
  { id: "restless", label: "Inquieto", color: "#9FCBAD" }, // light-green
  { id: "relaxed", label: "Relaxado", color: "#995F2F" }, // light-brown
  { id: "overwhelmed", label: "Sobrecarga", color: "#744577" }, // pastel purple
];

// Lookup helper
export const getMoodComponent = (id: string) =>
  MOOD_COMPONENTS.find((c) => c.id === id);

// Intensity label buckets
export const intensityLabel = (value: number | string): string => {
  if (typeof value == "number") {
    if (value == 1) return "Suave";
    if (value <= 2) return "Moderada";
    if (value <= 3) return "Intensa";
  } else {
    if (value === "LIGHT") return "Suave";
    if (value === "MODERATE") return "Moderada";
    if (value === "HIGH") return "Intensa";
  }
};

export const intensityToValue = (value: number): string => {
  if (value == 1) return "LIGHT";
  if (value <= 2) return "MODERATE";
  if (value <= 3) return "HIGH";
};
