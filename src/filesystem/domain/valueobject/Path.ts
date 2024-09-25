import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { fileExists } from "../../../common/utils/fileExists.ts";

export class Path implements ValueObject {
  constructor(public readonly value: string) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (this.value.trim().length === 0) {
      throw new DomainError("Path is empty");
    }

    if (this.value.endsWith("/")) {
      throw new DomainError(`Path ends with a slash: '${this.value}'`);
    }

    if (!fileExists(this.value)) {
      throw new DomainError(`Path does not exist: '${this.value}'`);
    }
  }

  public equals(other: unknown): boolean {
    if (other instanceof Path) {
      return this.value === other.value;
    }
    return false;
  }
}
