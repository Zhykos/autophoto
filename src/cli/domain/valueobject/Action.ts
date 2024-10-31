export interface Action {
  type(): ActionType;
}

export enum ActionType {
  PRESCANNER = "PRESCANNER",
  PUBLISHER = "PUBLISHER",
  SCANNER = "SCANNER",
}
