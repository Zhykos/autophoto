import { pathExists } from "../../../utils/file.ts";
import { DomainError } from "../DomainError.ts";
import type { ValueObject } from "../ValueObject.ts";

export class Path implements ValueObject {
  constructor(public readonly value: string) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (this.value.trim().length === 0) {
      throw new DomainError("Path is empty");
    }

    if (this.value.endsWith("/")) {
      throw new DomainError(`Path cannot ends with a slash: '${this.value}'`);
    }

    if (!pathExists(this.value)) {
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
