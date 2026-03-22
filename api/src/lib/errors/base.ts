// The shared shape all domain errors conform to.
// The type guard solves the `unknown` catch problem everywhere.

export class DomainError extends Error {
  constructor(public readonly message: string, public readonly status: number) {
    super(message);
    this.name = this.constructor.name; // makes logs say "DuplicateEmailError" not "Error"
    Object.setPrototypeOf(this, new.target.prototype); // fixes instanceof after transpile
  }
}

export function isDomainError(err: unknown): err is DomainError {
  return err instanceof DomainError;
}
