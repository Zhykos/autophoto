import { Log } from "@cross/log";

export enum LoggerStyle {
  BATCH = "batch",
  CONSOLE = "console",
}

export abstract class CLIAction {
  public databaseFilepath = "./db.autophoto.sqlite3";
  public debug = false;
  public logger = new Log();
}
