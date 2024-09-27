import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";

const platforms = ["Nintendo Switch", "PC"];

export class VideoGamePlatform implements ValueObject {
  public constructor(public readonly platform: string) {
    this.validateObjectProperties();
  }

  public validateObjectProperties(): void {
    if (!platforms.includes(this.platform)) {
      throw new DomainError(
        `Platform must be one of the following: ${platforms.join(", ")}`,
      );
    }
  }

  public equals(anotherObject: unknown): boolean {
    if (anotherObject instanceof VideoGamePlatform) {
      return this.platform === anotherObject.platform;
    }
    return false;
  }
}
