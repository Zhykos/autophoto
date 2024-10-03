import { crypto, type DigestAlgorithm } from "@std/crypto/crypto";
import { isFile } from "../../utils/file.ts";
import { DomainError } from "../DomainError.ts";
import type { ValueObject } from "../ValueObject.ts";
import type { Path } from "./Path.ts";

export class File implements ValueObject {
  private checksum: string | undefined = undefined;

  public constructor(public readonly path: Path) {
    this.validateObjectProperties();
  }

  public getChecksum(digestAlgorithm: DigestAlgorithm = "SHA-512"): string {
    if (this.checksum === undefined) {
      this.computeChecksum(digestAlgorithm);
    }
    return this.checksum as string;
  }

  public validateObjectProperties(): void {
    if (!isFile(this.path.value)) {
      throw new DomainError(`Path is not a file: "${this.path.value}"`);
    }
  }

  public equals(other: unknown): boolean {
    if (other instanceof File) {
      return (
        this.path.equals(other.path) &&
        this.getChecksum() === other.getChecksum()
      );
    }
    return false;
  }

  public getExtension(): string {
    return this.path.value.split(".").pop() ?? "";
  }

  private computeChecksum(digestAlgorithm: DigestAlgorithm): void {
    const text: string = Deno.readTextFileSync(this.path.value);
    const encoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(text);
    const digest: ArrayBuffer = crypto.subtle.digestSync(digestAlgorithm, data);
    const hashArray: number[] = Array.from(new Uint8Array(digest));
    this.checksum = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  public makeRelativeToPath(directory: Path): string {
    return this.path.value.replace(directory.value, "").substring(1);
  }
}
