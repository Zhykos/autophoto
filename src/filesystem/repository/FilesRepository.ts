import type { File } from "../domain/valueobject/File.ts";
import type { DataAccessor } from "./DataAccessor.ts";

export class FilesRepository {
  constructor(private readonly accessor: DataAccessor) {}

  async saveFiles(files: File[]): Promise<void> {
    console.log(`Saving ${files.length} files`);
    await this.accessor.saveFiles(files);
  }
}
