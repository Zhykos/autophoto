import type { DataAccessor } from "../../../src/filesystem/repository/DataAccessor.ts";
import type { File } from "../../../src/filesystem/domain/valueobject/File.ts";

export class FilesDataAccessor implements DataAccessor {
  async saveFiles(_: File[]): Promise<void> {
    // DO NOTHING
  }
}
