import type { Directory } from "../domain/valueobject/Directory.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FileType } from "../domain/valueobject/FileType.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";

export class Scan {
  constructor(private readonly repository: FilesRepository) {}

  public async scanAndSave(
    directoryToScan: Directory,
    type: FileType,
  ): Promise<void> {
    const files: File[] = await directoryToScan.scanDirectories();
    await this.repository.saveFiles(files, type);
  }
}
