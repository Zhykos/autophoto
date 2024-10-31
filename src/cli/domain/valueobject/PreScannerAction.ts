import type { File } from "../../../common/domain/valueobject/File.ts";
import { type Action, ActionType } from "./Action.ts";

export class PreScannerAction implements Action {
  constructor(public readonly configuration: File) {}

  type(): ActionType {
    return ActionType.PRESCANNER;
  }
}
