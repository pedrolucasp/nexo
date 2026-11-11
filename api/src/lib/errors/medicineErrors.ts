import { DomainError } from "./base";

export class MedicineRegimenNotFoundError extends DomainError {
  constructor() {
    super("Medicine regimen not found", 404);
  }
}
