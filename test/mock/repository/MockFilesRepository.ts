import type { FileEntity } from "../../../src/filesystem/domain/entity/FileEntity.ts";
import type { File } from "../../../src/filesystem/domain/valueobject/File.ts";
import type { FilesRepository } from "../../../src/filesystem/repository/FilesRepository.ts";

export class MockFilesRepository implements FilesRepository {
  private files: File[] = [];

  async saveFiles(filesToSave: File[]): Promise<FileEntity[]> {
    this.files = filesToSave;
    return [];
  }

  async getAllFiles(): Promise<File[]> {
    return this.files;
  }
}
