import type { ScanData } from "../domain/aggregate/ScanData.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";

export class Scan {
  constructor(private readonly repository: FilesRepository) {}

  public async scanAndSave(scanData: ScanData): Promise<void> {
    const files: File[] = await scanData.directory.scanDirectories();
    await this.repository.saveFiles(files, scanData.fileType);
  }
}
