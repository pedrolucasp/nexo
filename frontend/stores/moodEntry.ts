import { create } from 'zustand';

export interface ActiveMoodComponent {
  id: string;         // matches MoodComponentDefinition.id
  intensity: number; // 1–3
}

interface MoodEntryState {
  // The mood selected in the main screen (e.g. 'good')
  selectedMood: string | null;

  // The active components the user has added + their intensities
  components: ActiveMoodComponent[];

  // Actions
  setSelectedMood: (mood: string) => void;
  setComponents: (components: ActiveMoodComponent[]) => void;
  addComponent: (id: string) => void;
  removeComponent: (id: string) => void;
  setComponentIntensity: (id: string, intensity: number) => void;
  reset: () => void;
}

export const useMoodEntryStore = create<MoodEntryState>((set) => ({
  selectedMood: null,
  components: [],

  setSelectedMood: (mood) => set({ selectedMood: mood }),

  // Used by the modal to write back the full list at once
  setComponents: (components) => set({ components }),

  addComponent: (id) =>
    set((state) => {
      if (state.components.find((c) => c.id === id)) return state;
      return { components: [...state.components, { id, intensity: 1 }] };
    }),

  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
    })),

  setComponentIntensity: (id, intensity) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, intensity } : c
      ),
    })),

  reset: () => set({ selectedMood: null, components: [] }),
}));
