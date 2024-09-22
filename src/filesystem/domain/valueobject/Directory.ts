import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { Path } from "./Path.ts";
import { File } from "./File.ts";

export class Directory implements ValueObject {
  public constructor(public readonly rootDir: Path) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    // DO NOTHING
  }

  public equals(other: unknown): boolean {
    if (other instanceof Directory) {
      return this.rootDir.equals(other.rootDir);
    }
    return false;
  }

  public async scanDirectories(): Promise<File[]> {
    const files: File[] = [];
    await Directory.scanDirectory(this.rootDir.value, (file: File) => {
      files.push(file);
    });
    return files;
  }

  private static async scanDirectory(
    directory: string,
    onFileAdded: (file: File) => void,
  ): Promise<void> {
    for await (const dirEntry of Deno.readDir(directory)) {
      if (dirEntry.isDirectory) {
        await Directory.scanDirectory(
          `${directory}/${dirEntry.name}`,
          onFileAdded,
        );
      } else if (dirEntry.isFile) {
        if (dirEntry.name === ".DS_Store") {
          continue;
        }

        const file = new File(new Path(`${directory}/${dirEntry.name}`));
        onFileAdded(file);
      }
    }
  }
}
