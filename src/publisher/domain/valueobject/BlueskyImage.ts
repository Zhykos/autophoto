import type { BlobRef } from "@atproto/api";
import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";

export class BlueskyImage implements ValueObject {
  constructor(
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
      return this.alt === other.alt;
    }
    return false;
  }

  public static fromFile(blob: BlobRef, alt?: string): BlueskyImage {
    return new BlueskyImage(
      alt ?? "Video game screenshot, no more information available.",
      blob,
    );
  }
}
