import type { File } from "../../../src/filesystem/domain/valueobject/File.ts";
import type { DataAccessor } from "../../../src/filesystem/repository/DataAccessor.ts";

export class MockFilesDataAccessor implements DataAccessor {
  public files: File[] = [];

  async saveFiles(filesToSave: File[]): Promise<void> {
    this.files = filesToSave;
  }
}
