import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { ActionType } from "./cli/domain/valueobject/Action.ts";
import type { BlueskyPublisherAction } from "./cli/domain/valueobject/BlueskyPublisherAction.ts";
import type { PreScannerAction } from "./cli/domain/valueobject/PreScannerAction.ts";
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
  const kvDriver = new KvDriver(cli.databaseFilepath);

  try {
    if (cli.action.type() === ActionType.SCANNER) {
      console.log("Scanning...");
      const configuration: Configuration = new ConfigurationService().loadFile(
        cli.configuration.path.value,
      );
      await runScanner(configuration, kvDriver, cli.debug);
      return true;
    }

    if (cli.action.type() === ActionType.PUBLISHER) {
      console.log("Publishing...");
      const result: string | undefined = await publish(
        cli.action as BlueskyPublisherAction,
        kvDriver,
        cli.debug,
      );
      console.log("Publication result:", result ?? "Nothing to publish.");
      return true;
    }

    console.log("Pre-scanning...");
    const configuration: Configuration = new ConfigurationService().loadFile(
      (cli.action as PreScannerAction).configuration.path.value,
    );
    return preScan(configuration).errorsCount === 0;
  } finally {
    kvDriver.close();
    console.log("Autophoto finished.");
  }
}
