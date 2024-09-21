import { DomainError } from "../DomainError.ts";
import type { ValueObject } from "../ValueObject.ts";

export class VideoGameTitle implements ValueObject {
  public constructor(public readonly title: string) {
    this.validateObjectProperties();
  }

  public validateObjectProperties(): void {
    if (this.title.trim().length < 1) {
      throw new DomainError("Title must have at least 1 character");
    }
  }

  public equals(anotherObject: unknown): boolean {
    if (anotherObject instanceof VideoGameTitle) {
      return this.title === anotherObject.title;
    }
    return false;
  }
}
