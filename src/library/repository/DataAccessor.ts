import type { Library } from "../domain/aggregate/Library.ts";

export interface DataAccessor {
  loadLibrary(): Promise<Library>;
  saveLibrary(library: Library): Promise<void>;
}
