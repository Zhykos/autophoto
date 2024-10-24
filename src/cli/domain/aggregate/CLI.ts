import type { File } from "../../../common/domain/valueobject/File.ts";
import type { Action } from "../valueobject/Action.ts";
import { BlueskyCredentials } from "../valueobject/BlueskyCredentials.ts";

export class CLI {
  constructor(
    public readonly configuration: File,
    public readonly action: Action,
    public readonly databaseFilepath = "./db.autophoto.sqlite3",
    public readonly debugDatabase = false,
  ) {}

  static builder() {
    return new CLIBuilder();
  }
}

class ScannerAction implements Action {
  isScan(): boolean {
    return true;
  }
}

export class CLIBuilder {
  private configuration: File | undefined;
  private action: Action | undefined;
  private databaseFilepath: string | undefined;
  private debugDatabase = false;

  withConfiguration(configuration: File) {
    this.configuration = configuration;
    return this;
  }

  withScanner() {
    this.action = new ScannerAction();
    return this;
  }

  withDatabaseFilepath(databaseFilepath?: string) {
    this.databaseFilepath = databaseFilepath;
    return this;
  }

  withBluesky(host: URL, login: string, password: string) {
    this.action = new BlueskyCredentials(host, login, password);
    return this;
  }

  withDebugDatabase() {
    this.debugDatabase = true;
    return this;
  }

  build() {
    if (!this.configuration) {
      throw new Error("Configuration is required");
    }

    if (!this.action) {
      throw new Error("Action is required: scanner or bluesky publisher");
    }

    return new CLI(
      this.configuration,
      this.action,
      this.databaseFilepath,
      this.debugDatabase,
    );
  }
}
