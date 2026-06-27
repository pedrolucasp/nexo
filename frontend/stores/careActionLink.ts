import { create } from 'zustand';

const TTL_MS = 30 * 60 * 1000;

interface State {
  pendingId: number | null;
  expiresAt: number | null;
  triggerLinked: boolean;
  moodLinked: boolean;
  setPending: (id: number) => void;
  linkTrigger: () => number | null;
  linkMood: () => number | null;
  clear: () => void;
}

const isExpired = (expiresAt: number | null) =>
  !expiresAt || Date.now() > expiresAt;

export const useCareActionLinkStore = create<State>((set, get) => ({
  pendingId: null,
  expiresAt: null,
  triggerLinked: false,
  moodLinked: false,

  setPending: (id) =>
    set({ pendingId: id, expiresAt: Date.now() + TTL_MS, triggerLinked: false, moodLinked: false }),

  linkTrigger: () => {
    const { pendingId, expiresAt, triggerLinked, moodLinked } = get();
    if (!pendingId || isExpired(expiresAt)) {
      set({ pendingId: null, expiresAt: null, triggerLinked: false, moodLinked: false });
      return null;
    }
    if (triggerLinked) return null;

    const newMoodLinked = moodLinked;
    if (newMoodLinked) {
      set({ pendingId: null, expiresAt: null, triggerLinked: false, moodLinked: false });
    } else {
      set({ triggerLinked: true });
    }
    return pendingId;
  },

  linkMood: () => {
    const { pendingId, expiresAt, triggerLinked, moodLinked } = get();
    if (!pendingId || isExpired(expiresAt)) {
      set({ pendingId: null, expiresAt: null, triggerLinked: false, moodLinked: false });
      return null;
    }
    if (moodLinked) return null;

    const newTriggerLinked = triggerLinked;
    if (newTriggerLinked) {
      set({ pendingId: null, expiresAt: null, triggerLinked: false, moodLinked: false });
    } else {
      set({ moodLinked: true });
    }
    return pendingId;
  },

  clear: () => set({ pendingId: null, expiresAt: null, triggerLinked: false, moodLinked: false }),
}));
