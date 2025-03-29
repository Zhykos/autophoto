import type { Log } from "@cross/log";
import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { BlueskyImagesPublisherAction } from "./cli/domain/valueobject/BlueskyImagesPublisherAction.ts";
import { BlueskyStatsPublisherAction } from "./cli/domain/valueobject/BlueskyStatsPublisherAction.ts";
import type { PreScannerAction } from "./cli/domain/valueobject/PreScannerAction.ts";
import { ScannerAction } from "./cli/domain/valueobject/ScannerAction.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { ConfigurationService } from "./configuration/service/ConfigurationService.ts";
import { preScan } from "./prescan.ts";
import { publishImages } from "./publishImages.ts";
import { publishStats } from "./publishStats.ts";
import { runScanner } from "./scan.ts";

export async function main(cliArgs: string[]): Promise<boolean> {
  const cli: CLI = new CLIService().read(cliArgs);

  const logger: Log = cli.action.logger;
  logger.log("Starting Autophoto...");

  const kvDriver = new KvDriver(cli.action.databaseFilepath);

  try {
    if (cli.action instanceof ScannerAction) {
      return await privateScan(cli.action, kvDriver, logger);
    }

    if (cli.action instanceof BlueskyImagesPublisherAction) {
      return await privatePublishImages(cli.action, kvDriver, logger);
    }

    if (cli.action instanceof BlueskyStatsPublisherAction) {
      return await privatePublishStats(cli.action, kvDriver, logger);
    }

    return await privatePreScan(cli.action as PreScannerAction, logger);
  } finally {
    kvDriver.close();
    logger.log("Autophoto finished.");
  }
}

async function privateScan(
  action: ScannerAction,
  kvDriver: KvDriver,
  logger: Log,
): Promise<boolean> {
  logger.log("Scanning...");
  const configuration: Configuration = new ConfigurationService().loadFile(
    action.configurationFile.path.value,
  );
  await runScanner(configuration, kvDriver, action.debug, logger);
  return true;
}

async function privatePublishImages(
  action: BlueskyImagesPublisherAction,
  kvDriver: KvDriver,
  logger: Log,
): Promise<boolean> {
  logger.log("Publishing images...");
  const result: string | undefined = await publishImages(
    action,
    kvDriver,
    logger,
  );
  logger.log("Publication result:", result ?? "Nothing to publish.");
  return true;
}

async function privatePublishStats(
  action: BlueskyStatsPublisherAction,
  kvDriver: KvDriver,
  logger: Log,
): Promise<boolean> {
  logger.log("Publishing statistics...");
  const result: string | undefined = await publishStats(
    action,
    kvDriver,
    logger,
  );
  logger.log("Publication result:", result ?? "Nothing to publish.");
  return true;
}

function privatePreScan(
  action: PreScannerAction,
  logger: Log,
): Promise<boolean> {
  logger.log("Pre-scanning...");
  const configuration: Configuration = new ConfigurationService().loadFile(
    action.configurationFile.path.value,
  );
  const result: boolean = preScan(configuration, logger);
  return Promise.resolve(result);
}
