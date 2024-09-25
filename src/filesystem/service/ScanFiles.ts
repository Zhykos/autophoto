import type { Directory } from "../domain/valueobject/Directory.ts";
import type { File } from "../domain/valueobject/File.ts";

export class ScanFiles {
  public async scan(directories: Directory[]): Promise<Map<Directory, File[]>> {
    const dirFilesMap = new Map<Directory, File[]>();
    for await (const directory of directories) {
      const files: File[] = await directory.scanDirectories();
      dirFilesMap.set(directory, files);
    }
    return dirFilesMap;
  }
}
