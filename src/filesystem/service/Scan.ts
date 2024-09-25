import type { Directory } from "../domain/valueobject/Directory.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FileType } from "../domain/valueobject/FileType.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";
import type { ScanFiles } from "./ScanFiles.ts";

export class Scan {
  constructor(
    private readonly scanFileService: ScanFiles,
    private readonly repository: FilesRepository,
  ) {}

  public async scanAndSave(
    directoryToScan: Directory,
    type: FileType,
  ): Promise<void> {
    const filesMap: Map<Directory, File[]> = await this.scanFileService.scan([
      directoryToScan,
    ]);

    for (const [_, files] of filesMap) {
      await this.saveFiles(files, type);
    }
  }

  public async saveFiles(files: File[], type: FileType): Promise<void> {
    await this.repository.saveFiles(files, type);
  }
}
