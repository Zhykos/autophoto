import type { Directory } from "../../../common/domain/valueobject/Directory.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";
import { Image } from "../valueobject/Image.ts";

export class ImageDirectory {
  constructor(
    public readonly directory: Directory,
    public readonly fileFetchPattern: RegExp,
    public readonly fileFetchPatternGroups: string[],
  ) {}

  async scan(): Promise<Image[]> {
    const files: File[] = await this.directory.scanDirectories(
      this.fileFetchPattern,
    );

    return files.map((file) => new Image(file));
  }
}
