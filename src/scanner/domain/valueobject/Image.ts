import { allExtensions } from "@std/media-types";
import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { Directory } from "../../../common/domain/valueobject/Directory.ts";
import { File } from "../../../common/domain/valueobject/File.ts";
import { Path } from "../../../common/domain/valueobject/Path.ts";

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

  public get fullpath(): File {
    return new File(
      new Path(
        `${this.scannerRootDirectory.path.value}/${this.file.path.value}`,
      ),
    );
  }
}
