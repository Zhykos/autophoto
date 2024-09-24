import { crypto } from "@std/crypto/crypto";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { Path } from "./Path.ts";

export class File implements ValueObject {
  private checksum: string | undefined = undefined;

  public constructor(public readonly path: Path) {
    this.validateObjectProperties();
  }

  public async getChecksum(): Promise<string> {
    if (this.checksum === undefined) {
      await this.computeChecksum();
    }
    return this.checksum as string;
  }

  public validateObjectProperties(): void {
    // DO NOTHING
  }

  public equals(other: unknown): boolean {
    if (other instanceof File) {
      return this.path.equals(other.path) && this.checksum === other.checksum;
    }
    return false;
  }

  private async computeChecksum(): Promise<void> {
    const text: string = await Deno.readTextFile(this.path.value);
    const encoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(text);
    const digest: ArrayBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray: number[] = Array.from(new Uint8Array(digest));
    this.checksum = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
