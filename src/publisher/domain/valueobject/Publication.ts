import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";

export class Publication implements ValueObject {
  constructor(
    public readonly message: string,
    public readonly images?: File[],
    public readonly alts?: string[],
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (this.message.trim().length === 0) {
      throw new DomainError("Message is empty!");
    }

    if (this.images && this.images.length > 4) {
      throw new DomainError("Too many images!");
    }

    if (this.alts && this.alts.length !== this.images?.length) {
      throw new DomainError("Alts length does not match images length!");
    }

    if (this.alts?.some((alt) => alt.trim().length === 0)) {
      throw new DomainError("There is an alt message which is empty!");
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof Publication) {
      return (
        this.message === other.message &&
        this.images?.length === other.images?.length &&
        this.images?.every((image, index) =>
          image.equals(other.images?.at(index)),
        ) === true
      );
    }
    return false;
  }
}
