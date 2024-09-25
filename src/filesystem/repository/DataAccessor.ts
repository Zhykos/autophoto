import type { File } from "../domain/valueobject/File.ts";
import type { FileType } from "../domain/valueobject/FileType.ts";

export interface DataAccessor {
  saveFiles(files: File[], type: FileType): Promise<void>;
}
