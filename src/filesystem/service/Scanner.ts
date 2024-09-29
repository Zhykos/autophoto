import type { ScanData } from "../domain/aggregate/ScanData.ts";
import type { FileEntity } from "../domain/entity/FileEntity.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";

export class Scanner {
  constructor(private readonly repository: FilesRepository) {}

  public async scanAndSaveNewFiles(scanData: ScanData): Promise<FileEntity[]> {
    const scannedFiles: File[] = await scanData.directory.scanDirectories(
      scanData.pattern,
    );

    const repositoryFiles: File[] = await this.repository.getAllFiles();

    const filesToSave: File[] = scannedFiles.filter(
      (file) => !repositoryFiles.some((f) => f.equals(file)),
    );

    return await this.repository.saveFiles(filesToSave);
  }
}
