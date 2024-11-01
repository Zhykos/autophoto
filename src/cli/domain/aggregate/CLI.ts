import type { File } from "../../../common/domain/valueobject/File.ts";
import { BlueskyPublisherAction } from "../valueobject/BlueskyPublisherAction.ts";
import type { CLIExecutor } from "../valueobject/CLIExecutor.ts";
import { PreScannerAction } from "../valueobject/PreScannerAction.ts";
import { ScannerAction } from "../valueobject/ScannerAction.ts";

export class CLI {
  constructor(public readonly action: CLIExecutor) {}

  static builder() {
    return new CLIBuilder();
  }
}

export class CLIBuilder {
  private action: CLIExecutor | undefined;

  withScanner(configurationFile: File) {
    this.action = new ScannerAction(configurationFile);
    return this;
  }

  withBluesky(host: URL, login: string, password: string) {
    this.action = new BlueskyPublisherAction(host, login, password);
    return this;
  }

  withPreScanner(configurationFile: File) {
    this.action = new PreScannerAction(configurationFile);
    return this;
  }

  withDatabaseFilepath(databaseFilepath: string) {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    this.action.databaseFilepath = databaseFilepath;
    return this;
  }

  withDebug() {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    this.action.debug = true;
    return this;
  }

  build() {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    return new CLI(this.action);
  }
}
