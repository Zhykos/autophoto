import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { Directory } from "../../domain/valueobject/Directory.ts";
import type { DirectoryType } from "../../domain/valueobject/DirectoryType.ts";
import type { ConfigurationDataPattern } from "./ConfigurationDataPattern.ts";

export class ConfigurationScanWithPattern implements ValueObject {
  constructor(
    public readonly directory: Directory,
    public readonly directoryType: DirectoryType,
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
        this.directoryType === other.directoryType
      );
    }
    return false;
  }
}
