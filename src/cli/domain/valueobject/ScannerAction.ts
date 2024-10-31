import { type Action, ActionType } from "./Action.ts";

export class ScannerAction implements Action {
  type(): ActionType {
    return ActionType.SCANNER;
  }
}
