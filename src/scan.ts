import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import { KvImageRepository } from "./common/repository/ImageRepository.ts";
import { KvRelationRepository } from "./common/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./common/repository/VideoGameRepository.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ConfigurationService } from "./configuration/service/ConfigurationService.ts";
import { ImageDirectory } from "./scanner/domain/aggregate/ImageDirectory.ts";
import { Scanner } from "./scanner/service/Scanner.ts";

export const runScanner = async (args: string[]) => {
  const cli: CLI = new CLIService().read(args);
  const kvDriver = new KvDriver(cli.databaseFilepath);

  try {
    const scanner = new Scanner(
      new KvImageRepository(kvDriver),
      new KvVideoGameRepository(kvDriver),
      new KvRelationRepository(kvDriver),
    );

    const configuration: Configuration = new ConfigurationService().loadFile(
      cli.configuration.path.value,
    );

    await scan(scanner, configuration.scans);
  } finally {
    kvDriver.close();
  }
};

export async function scan(
  scanner: Scanner,
  scanData: ConfigurationScanWithPattern[],
): Promise<void> {
  let hasError = false;

  try {
    console.log("Scanning...");
    // TODO Alerting
    for (const scan of scanData) {
      console.log(`Scanning ${scan.directory.path.value}...`);
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
    hasError = true;
    console.error("An error occurred while scanning.");
    console.error(error);
  }

  if (hasError) {
    throw new Error("An error occurred while scanning.");
  }
}
