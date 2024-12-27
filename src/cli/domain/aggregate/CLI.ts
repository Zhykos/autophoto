import { Log, LogTransportBase, Severity } from "@cross/log";
import type { File } from "../../../common/domain/valueobject/File.ts";
import { BlueskyPublisherAction } from "../valueobject/BlueskyPublisherAction.ts";
import { type CLIAction, LoggerStyle } from "../valueobject/CLIAction.ts";
import { PreScannerAction } from "../valueobject/PreScannerAction.ts";
import { ScannerAction } from "../valueobject/ScannerAction.ts";

export class CLI {
  constructor(public readonly action: CLIAction) {}

  static builder() {
    return new CLIBuilder();
  }
}

export class CLIBuilder {
  private action: CLIAction | undefined;

  withScanner(configurationFile: File): void {
    this.action = new ScannerAction(configurationFile);
  }

  withBluesky(host: URL, login: string, password: string): void {
    this.action = new BlueskyPublisherAction(host, login, password);
  }

  withPreScanner(configurationFile: File): void {
    this.action = new PreScannerAction(configurationFile);
  }

  withDatabaseFilepath(databaseFilepath: string): void {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    this.action.databaseFilepath = databaseFilepath;
  }

  withDebug(): void {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    this.action.debug = true;
  }

  withLogger(loggerStyle: LoggerStyle | undefined): Log {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    if (loggerStyle === LoggerStyle.BATCH) {
      // No format, no color
      this.action.logger = new Log([new BatchLogger()]);
    }

    return this.action.logger;
  }

  build(): CLI {
    if (!this.action) {
      throw new Error("Action is required: prescanner, publisher or scanner");
    }

    return new CLI(this.action);
  }
}

// From https://jsr.io/@cross/log CustomLogger
export class BatchLogger extends LogTransportBase {
  constructor() {
    super();
    this.options = { ...this.defaults };
  }

  log(level: Severity, _: string, data: unknown[], timestamp: Date) {
    if (this.shouldLog(level)) {
      const formattedMessage: string = `${timestamp.toISOString()} ${level} ${data.join(
        " ",
      )}`;

      if (level === Severity.Error) {
        console.error(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }
}
