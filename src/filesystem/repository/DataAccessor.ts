import type { File } from "../domain/valueobject/File.ts";

export interface DataAccessor {
  saveFiles(files: File[]): Promise<void>;
}
