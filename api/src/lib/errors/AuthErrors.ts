import { DomainError } from "./base";

export class InvalidCredentialsError extends DomainError {
  constructor() { super("Invalid email or password", 401); }
}

export class UnauthorizedError extends DomainError {
  constructor() { super("You must be logged in", 401); }
}
