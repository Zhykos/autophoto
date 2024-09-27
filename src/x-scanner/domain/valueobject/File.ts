import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { isFile } from "../../../common/utils/file.ts";
import type { Path } from "./Path.ts";

export class File implements ValueObject {
  public constructor(public readonly path: Path) {
    this.validateObjectProperties();
  }

  public validateObjectProperties(): void {
    if (!isFile(this.path.value)) {
      throw new DomainError(`Path is not a file: "${this.path.value}"`);
    }
  }

  public equals(other: unknown): boolean {
    if (other instanceof File) {
      return this.path.equals(other.path);
    }
    return false;
  }
}
