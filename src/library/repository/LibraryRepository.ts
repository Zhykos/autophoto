import type { Library } from "../domain/aggregate/Library.ts";
import type { DataAccessor } from "./DataAccessor.ts";

export class LibraryRepository {
  constructor(private readonly accessor: DataAccessor) {}

  async loadLibrary(): Promise<Library> {
    return await this.accessor.loadLibrary();
  }

  async saveLibrary(library: Library): Promise<void> {
    await this.accessor.saveLibrary(library);
  }
}
