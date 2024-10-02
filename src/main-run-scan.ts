import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ReadConfiguration } from "./configuration/service/ReadConfiguration.ts";
import { ImageDirectory } from "./scanner/domain/aggregate/ImageDirectory.ts";
import { KvImageRepository } from "./scanner/repository/ImageRepository.ts";
import { KvRelationRepository } from "./scanner/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./scanner/repository/VideoGameRepository.ts";
import { Scanner } from "./scanner/service/Scanner.ts";

const cli: CLI = new CLIService().read(Deno.args);
const kvDriver = new KvDriver(cli.databaseFilepath ?? "./data/database.db");

try {
  const scanner = new Scanner(
    new KvImageRepository(kvDriver),
    new KvVideoGameRepository(kvDriver),
    new KvRelationRepository(kvDriver),
  );

  const configuration: Configuration = new ReadConfiguration().load(
    cli.configuration.path.value,
  );

  if (cli.cron) {
    Deno.cron("Schedule scan", cli.cron, async () => {
      console.log("Scanning scheduled...", new Date());
      await scan(scanner, configuration.scans);
    });
  } else {
    await scan(scanner, configuration.scans);
  }
} finally {
  kvDriver.close();
}

async function scan(
  scanner: Scanner,
  scanData: ConfigurationScanWithPattern[],
): Promise<void> {
  try {
    console.log("Scanning...");
    // TODO Alerting
    for (const scan of scanData) {
      console.log(`Scanning ${scan.directory.rootDir.value}...`);
      const imageDirectory = new ImageDirectory(
        scan.directory,
        scan.pattern.regex,
        scan.pattern.groups,
      );
      await scanner.scanAndSaveNewImages(imageDirectory);
    }
    console.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    console.error("An error occurred while scanning.");
    console.error(error);
  }
}
