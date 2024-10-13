import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";

export class Publication implements ValueObject {
  constructor(
    public readonly message: string,
    public readonly images: File[],
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (this.message.trim().length === 0) {
      throw new Error("Message is empty!");
    }

    if (this.images.length === 0) {
      throw new Error("Images are empty!");
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof Publication) {
      return (
        this.message === other.message &&
        this.images.length === other.images.length &&
        this.images.every((image, index) => image.equals(other.images[index]))
      );
    }
    return false;
  }
}
