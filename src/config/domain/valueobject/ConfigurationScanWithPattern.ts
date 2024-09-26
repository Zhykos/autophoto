import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { Directory } from "../../../filesystem/domain/valueobject/Directory.ts";
import type { FileType } from "../../../filesystem/domain/valueobject/FileType.ts";
import type { ConfigurationDataPattern } from "./ConfigurationDataPattern.ts";

export class ConfigurationScanWithPattern implements ValueObject {
  constructor(
    public readonly directory: Directory,
    public readonly fileType: FileType,
    public readonly pattern: ConfigurationDataPattern,
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    // DO NOTHING
  }

  public equals(other: unknown): boolean {
    if (other instanceof ConfigurationScanWithPattern) {
      return (
        this.directory.equals(other.directory) &&
        this.pattern.equals(other.pattern) &&
        this.fileType === other.fileType
      );
    }
    return false;
  }
}
