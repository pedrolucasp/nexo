import { DomainError } from "./base";

export class InvalidCareActionSubtypeError extends DomainError {
  constructor(subtype: string) {
    super(`Care action does not accept ${subtype} fields`, 400);
  }
}
