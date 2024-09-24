import { CommonKvAccessor } from "../../../common/repository/CommonKvAccessor.ts";
import type { File } from "../../domain/valueobject/File.ts";
import type { DataAccessor } from "../DataAccessor.ts";

export class KvAccessor extends CommonKvAccessor implements DataAccessor {
  saveFiles(files: File[]): Promise<void> {}
}
