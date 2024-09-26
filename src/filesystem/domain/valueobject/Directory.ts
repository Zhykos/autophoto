import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { isDirectory } from "../../../common/utils/file.ts";
import { File } from "./File.ts";
import { Path } from "./Path.ts";

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

  public async scanDirectories(pattern: RegExp): Promise<File[]> {
    const files: File[] = [];
    await Directory.scanDirectory(this.rootDir.value, pattern, (file: File) => {
      files.push(file);
    });
    return files;
  }

  private static async scanDirectory(
    directory: string,
    pattern: RegExp,
    onFileAdded: (file: File) => void,
  ): Promise<void> {
    for await (const dirEntry of Deno.readDir(directory)) {
      if (dirEntry.isDirectory) {
        await Directory.scanDirectory(
          `${directory}/${dirEntry.name}`,
          pattern,
          onFileAdded,
        );
      } else if (dirEntry.isFile) {
        if (dirEntry.name === ".DS_Store" || !pattern.test(dirEntry.name)) {
          continue;
        }

        const file = new File(new Path(`${directory}/${dirEntry.name}`));
        onFileAdded(file);
      }
    }
  }
}
