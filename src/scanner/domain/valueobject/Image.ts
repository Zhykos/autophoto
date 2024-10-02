import { allExtensions } from "@std/media-types";
import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";

export class Image implements ValueObject {
  constructor(public readonly file: File) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (!allExtensions("image/webp")?.includes(this.file.getExtension())) {
      throw new DomainError(
        `"${this.file.getExtension()}" is not a valid WEBP image extension`,
      );
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof Image) {
      return this.file.equals(other.file);
    }
    return false;
  }
}
