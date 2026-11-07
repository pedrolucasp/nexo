import { DomainError } from "./errors/base";

export const EDITING_WINDOW_MS = 5 * 60 * 1000;

export class EditingWindowExpiredError extends DomainError {
  constructor() {
    super("Editing window has expired", 403);
  }
}

// Records may be edited or removed only shortly after they are created, so the
// History and the Insights derived from it stop shifting. Anchored to creation
// rather than to the record's own moment: a backdated entry is not thereby
// editable later.
export function assertWithinEditingWindow(createdAt: Date): void {
  if (Date.now() - createdAt.getTime() >= EDITING_WINDOW_MS) {
    throw new EditingWindowExpiredError();
  }
}
