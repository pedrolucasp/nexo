import { DomainError } from "./base";

export class MissingFieldsError extends DomainError {
  constructor(fields: string[]) {
    super(`Missing required fields: ${fields.join(", ")}`, 400);
  }
}

export class ShortPasswordError extends DomainError {
  constructor() { super("Password must be at least 8 characters", 400); }
}

export class DuplicateEmailError extends DomainError {
  constructor(email: string) { super(`${email} is already in use`, 409); }
}

export class InvalidEmailError extends DomainError {
  constructor() {
    super(`Email is invalid`, 400);
  }
}


export class UserNotFoundError extends DomainError {
  constructor(id?: number) {
    super(id ? `User ${id} not found` : "User not found", 404);
  }
}
