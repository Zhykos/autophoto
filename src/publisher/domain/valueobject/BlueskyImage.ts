import type { BlobRef } from "@atproto/api";
import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";

export class BlueskyImage implements ValueObject {
  constructor(
    private readonly file: File,
    public readonly alt: string,
    public readonly imageBlobRef: BlobRef,
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (this.alt.trim().length === 0) {
      throw new DomainError("Alt is empty!");
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof BlueskyImage) {
      return this.file.equals(other.file);
    }
    return false;
  }

  public static fromFile(
    file: File,
    blob: BlobRef,
    alt?: string,
  ): BlueskyImage {
    return new BlueskyImage(
      file,
      alt ?? "Video game screenshot, no more information available.",
      blob,
    );
  }
}
