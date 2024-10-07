import { allExtensions } from "@std/media-types";
import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { Directory } from "../../../common/domain/valueobject/Directory.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";

export class Image implements ValueObject {
  constructor(
    public readonly scannerRootDirectory: Directory,
    public readonly file: File,
  ) {
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
      return (
        this.file.makeRelativeToPath(this.scannerRootDirectory.path) ===
        other.file.makeRelativeToPath(other.scannerRootDirectory.path)
      );
    }
    return false;
  }
}
