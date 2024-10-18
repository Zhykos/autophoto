import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";

export class Credentials implements ValueObject {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (this.identifier.trim().length === 0) {
      throw new DomainError("Identifier is empty!");
    }

    if (this.password === "") {
      throw new Error("Password is empty!");
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof Credentials) {
      return (
        this.identifier === other.identifier && this.password === other.password
      );
    }
    return false;
  }
}
