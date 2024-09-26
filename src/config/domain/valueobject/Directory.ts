import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { isDirectory } from "../../../common/utils/file.ts";
import type { Path } from "./Path.ts";

export class Directory implements ValueObject {
  public constructor(public readonly rootDir: Path) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (!isDirectory(this.rootDir.value)) {
      throw new DomainError(`Path is not a directory: "${this.rootDir.value}"`);
    }
  }

  public equals(other: unknown): boolean {
    if (other instanceof Directory) {
      return this.rootDir.equals(other.rootDir);
    }
    return false;
  }
}
