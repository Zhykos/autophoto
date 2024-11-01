import { Log } from "@cross/log";
import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { BlueskyPublisherAction } from "./cli/domain/valueobject/BlueskyPublisherAction.ts";
import type { PreScannerAction } from "./cli/domain/valueobject/PreScannerAction.ts";
import { ScannerAction } from "./cli/domain/valueobject/ScannerAction.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { ConfigurationService } from "./configuration/service/ConfigurationService.ts";
import { preScan } from "./prescan.ts";
import { publish } from "./publish.ts";
import { runScanner } from "./scan.ts";

export async function main(cliArgs: string[]): Promise<boolean> {
  console.log("Starting Autophoto...");

  const cli: CLI = new CLIService().read(cliArgs);
  const kvDriver = new KvDriver(cli.action.databaseFilepath);
  const logger = new Log();

  try {
    if (cli.action instanceof ScannerAction) {
      console.log("Scanning...");
      const configuration: Configuration = new ConfigurationService().loadFile(
        cli.action.configurationFile.path.value,
      );
      await runScanner(configuration, kvDriver, cli.action.debug);
      return true;
    }

    if (cli.action instanceof BlueskyPublisherAction) {
      console.log("Publishing...");
      const result: string | undefined = await publish(cli.action, kvDriver);
      console.log("Publication result:", result ?? "Nothing to publish.");
      return true;
    }

    console.log("Pre-scanning...");
    const configuration: Configuration = new ConfigurationService().loadFile(
      (cli.action as PreScannerAction).configurationFile.path.value,
    );
    return preScan(configuration, logger);
  } finally {
    kvDriver.close();
    console.log("Autophoto finished.");
  }
}
