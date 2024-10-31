import type { File } from "../../../common/domain/valueobject/File.ts";
import type { Action } from "../valueobject/Action.ts";
import { BlueskyPublisherAction } from "../valueobject/BlueskyPublisherAction.ts";
import { PreScannerAction } from "../valueobject/PreScannerAction.ts";
import { ScannerAction } from "../valueobject/ScannerAction.ts";

export class CLI {
  constructor(
    public readonly configuration: File,
    public readonly action: Action,
    public readonly databaseFilepath = "./db.autophoto.sqlite3",
    public readonly debug = false,
  ) {}

  static builder() {
    return new CLIBuilder();
  }
}

export class CLIBuilder {
  private configuration: File | undefined;
  private action: Action | undefined;
  private databaseFilepath: string | undefined;
  private debug = false;

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
    this.action = new BlueskyPublisherAction(host, login, password);
    return this;
  }

  withDebug() {
    this.debug = true;
    return this;
  }

  withPreScanner(configuration: File) {
    this.action = new PreScannerAction(configuration);
    return this;
  }

  build() {
    if (!this.configuration) {
      throw new Error("Configuration is required");
    }

    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    return new CLI(
      this.configuration,
      this.action,
      this.databaseFilepath,
      this.debug,
    );
  }
}
