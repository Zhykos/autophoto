import type { File } from "../../../src/filesystem/domain/valueobject/File.ts";
import type { DataAccessor } from "../../../src/filesystem/repository/DataAccessor.ts";

export class MockFilesDataAccessor implements DataAccessor {
  async saveFiles(_: File[]): Promise<void> {
    // DO NOTHING
  }
}
