import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

export function formatValidationError(err: ZodError) {
  const fields: Record<string, string> = {};

  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_form';
    if (!fields[key]) fields[key] = issue.message;
  }

  return {
    error: fromZodError(err).message,
    fields,
  };
}
