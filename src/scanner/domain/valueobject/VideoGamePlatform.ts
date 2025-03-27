import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";

const platforms = [
  "Android",
  "Android (preview)",
  "iOS",
  "Nintendo Switch",
  "PC",
  "PC (alpha)",
  "PC (demo)",
  "PC (early access)",
  "PlayStation 4",
  "PlayStation 4 (beta)",
  "PlayStation 4 (demo)",
  "PlayStation 5",
  "PS Vita",
  "Steam Deck",
  "unknown",
  "Xbox 360",
  "Xbox Game Cloud",
  "Xbox One",
  "Xbox Series X",
  "Xbox Series X (beta)",
];

export class VideoGamePlatform implements ValueObject {
  public constructor(public readonly value: string) {
    this.validateObjectProperties();
  }

  public validateObjectProperties(): void {
    if (!platforms.includes(this.value)) {
      throw new DomainError(
        `Platform (${this.value}) must be one of the following: ${
          platforms.sort().join(", ")
        }`,
      );
    }
  }

  public equals(anotherObject: unknown): boolean {
    if (anotherObject instanceof VideoGamePlatform) {
      return this.value === anotherObject.value;
    }
    return false;
  }
}
