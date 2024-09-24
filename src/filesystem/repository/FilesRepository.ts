import type { File } from "../domain/valueobject/File.ts";
import type { DataAccessor } from "./DataAccessor.ts";

export class FilesRepository {
  constructor(private readonly accessor: DataAccessor) {}

  async saveFiles(files: File[]): Promise<void> {
    await this.accessor.saveFiles(files);
  }
}
