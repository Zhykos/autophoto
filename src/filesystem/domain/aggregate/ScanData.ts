import type { Directory } from "../valueobject/Directory.ts";

export class ScanData {
  constructor(
    public readonly directory: Directory,
    public readonly pattern: RegExp,
  ) {}
}
