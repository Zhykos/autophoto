import type { Directory } from "../valueobject/Directory.ts";
import type { FileType } from "../valueobject/FileType.ts";

export class ScanData {
  constructor(
    public readonly directory: Directory,
    public readonly fileType: FileType,
  ) {}
}
