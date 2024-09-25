import type { File } from "../domain/valueobject/File.ts";
import type { FileType } from "../domain/valueobject/FileType.ts";
import type { DataAccessor } from "./DataAccessor.ts";

export class FilesRepository {
  constructor(private readonly accessor: DataAccessor) {}

  async saveFiles(files: File[], type: FileType): Promise<void> {
    await this.accessor.saveFiles(files, type);
  }
}
