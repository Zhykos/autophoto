import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";

export class VideoGameReleaseYear implements ValueObject {
  public constructor(public readonly year: number) {
    this.validateObjectProperties();
  }

  public validateObjectProperties(): void {
    if (this.year < 1900) {
      // 1900 is an arbitrary value but I'm pretty sure that no video game was released before that year
      throw new DomainError(
        `Year ${this.year} must be greater than or equal to 1900`,
      );
    }
  }

  public equals(anotherObject: unknown): boolean {
    if (anotherObject instanceof VideoGameReleaseYear) {
      return this.year === anotherObject.year;
    }
    return false;
  }
}
