import { crypto } from "@std/crypto/crypto";
import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { isFile } from "../../../common/utils/file.ts";
import type { Path } from "./Path.ts";

export class File implements ValueObject {
  private checksum: string | undefined = undefined;

  public constructor(public readonly path: Path) {
    this.validateObjectProperties();
  }

  public getChecksum(): string {
    if (this.checksum === undefined) {
      this.computeChecksum();
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
      return this.getChecksum() === other.getChecksum();
    }
    return false;
  }

  private computeChecksum(): void {
    const text: string = Deno.readTextFileSync(this.path.value);
    const encoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(text);
    const digest: ArrayBuffer = crypto.subtle.digestSync("SHA-512", data);
    const hashArray: number[] = Array.from(new Uint8Array(digest));
    this.checksum = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
