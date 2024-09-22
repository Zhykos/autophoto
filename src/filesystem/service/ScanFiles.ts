import type { File } from "../domain/valueobject/File.ts";
import type { Directory } from "../domain/valueobject/Directory.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";

export class ScanFiles {
  constructor(private readonly repository: FilesRepository) {}

  public async scan(directories: Directory[]): Promise<Map<Directory, File[]>> {
    const dirFilesMap = new Map<Directory, File[]>();
    for await (const directory of directories) {
      const files: File[] = await directory.scanDirectories();
      dirFilesMap.set(directory, files);
    }
    return dirFilesMap;
  }

  public async saveFiles(files: File[]): Promise<void> {
    await this.repository.saveFiles(files);
  }
}
