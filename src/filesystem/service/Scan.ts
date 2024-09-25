import type { File } from "../domain/valueobject/File.ts";
import type { FilesRepository } from "../repository/FilesRepository.ts";

export class Scan {
  constructor(private readonly repository: FilesRepository) {}

  public async saveFiles(files: File[]): Promise<void> {
    await this.repository.saveFiles(files);
  }
}
