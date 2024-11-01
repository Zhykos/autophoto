import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { isDirectory } from "../../../utils/file.ts";
import { scanDirectory } from "../../../utils/scan-directory.ts";
import { File } from "./File.ts";
import { Path } from "./Path.ts";

export class Directory implements ValueObject {
  public constructor(public readonly path: Path) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (!isDirectory(this.path.value)) {
      throw new DomainError(`Path is not a directory: "${this.path.value}"`);
    }
  }

  public equals(other: unknown): boolean {
    if (other instanceof Directory) {
      return this.path.equals(other.path);
    }
    return false;
  }

  public scanDirectories(pattern: RegExp): File[] {
    const files: File[] = [];
    scanDirectory(this.path.value, pattern, (file: string) =>
      files.push(new File(new Path(file))),
    );
    return files;
  }
}
