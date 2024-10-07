import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";

export class VideoGameTitle implements ValueObject {
  public constructor(public readonly value: string) {
    this.validateObjectProperties();
  }

  public validateObjectProperties(): void {
    if (this.value.trim().length < 1) {
      throw new DomainError("Title must have at least 1 character");
    }
  }

  public equals(anotherObject: unknown): boolean {
    if (anotherObject instanceof VideoGameTitle) {
      return this.value === anotherObject.value;
    }
    return false;
  }
}
