import { useEffect, useState } from "react";

export const EDITING_WINDOW_MS = 5 * 60 * 1000;

export interface EditingWindow {
  canEdit: boolean;
  minutesLeft: number;
  buttonSuffix: string;
}

// Pure so the boundary rules can be pinned down without a renderer.
export function editingWindowAt(
  createdAt: Date | string | null | undefined,
  now: number,
): EditingWindow {
  if (!createdAt) {
    return { canEdit: false, minutesLeft: 0, buttonSuffix: "(Expirado)" };
  }

  const msSinceCreation = now - new Date(createdAt).getTime();
  const canEdit = msSinceCreation < EDITING_WINDOW_MS;
  const minutesLeft = Math.max(
    0,
    Math.ceil((EDITING_WINDOW_MS - msSinceCreation) / 60000),
  );

  const timeLeft = minutesLeft < 1 ? "<1" : minutesLeft;
  const buttonSuffix = canEdit ? `(Disp. por ${timeLeft}:00)` : "(Expirado)";

  return { canEdit, minutesLeft, buttonSuffix };
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
