import type { ScanData } from "../domain/aggregate/ScanData.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";

export class Scanner {
  constructor(private readonly repository: FilesRepository) {}

  public async scanAndSave(scanData: ScanData): Promise<File[]> {
    const newFiles: File[] = await scanData.directory.scanDirectories(
      scanData.pattern,
    );

    const allFiles: File[] = await this.repository.getAllFiles();

    const filesToSave: File[] = newFiles.filter((file) => {
      return !allFiles.some((f) => f.path.equals(file.path));
    });

    await this.repository.saveFiles(filesToSave);
    return filesToSave;
  }
}
