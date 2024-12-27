import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { File } from "../../../common/domain/valueobject/File.ts";
import { CLIAction } from "./CLIAction.ts";

export class PreScannerAction extends CLIAction implements ValueObject {
  constructor(public readonly configurationFile: File) {
    super();
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    // DO NOTHING
  }

  equals(other: unknown): boolean {
    if (other instanceof PreScannerAction) {
      return this.configurationFile.equals(other.configurationFile);
    }
    return false;
  }
}
