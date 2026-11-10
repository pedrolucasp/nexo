import { useEffect, useState } from "react";

export const EDITING_WINDOW_MS = 5 * 60 * 1000;

export interface EditingWindow {
  canEdit: boolean;
  minutesLeft: number;
  countdown: string;
}

function formatCountdown(msLeft: number): string {
  const totalSeconds = Math.ceil(msLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Pure so the boundary rules can be pinned down without a renderer.
export function editingWindowAt(
  createdAt: Date | string | null | undefined,
  now: number,
): EditingWindow {
  if (!createdAt) {
    return { canEdit: false, minutesLeft: 0, countdown: "" };
  }

  const msLeft = EDITING_WINDOW_MS - (now - new Date(createdAt).getTime());
  const canEdit = msLeft > 0;
  const minutesLeft = Math.max(0, Math.ceil(msLeft / 60000));

  return {
    canEdit,
    minutesLeft,
    countdown: canEdit ? formatCountdown(msLeft) : "",
  };
}

// Records may be edited or removed only shortly after they are created. The
// API is the authority; this mirrors the countdown so the UI can explain
// itself instead of presenting a button that will be rejected.
export function useEditingWindow(
  createdAt?: Date | string | null,
): EditingWindow {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return editingWindowAt(createdAt, now);
}
