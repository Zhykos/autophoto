import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ImageDirectory } from "./scanner/domain/aggregate/ImageDirectory.ts";
import { KvImageRepository } from "./scanner/repository/ImageRepository.ts";
import { KvRelationRepository } from "./scanner/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./scanner/repository/VideoGameRepository.ts";
import { Scanner } from "./scanner/service/Scanner.ts";

export const runScanner = async (
  configuration: Configuration,
  kvDriver: KvDriver,
  debugDatabase: boolean,
): Promise<void> => {
  const scanner = new Scanner(
    new KvImageRepository(kvDriver),
    new KvVideoGameRepository(kvDriver),
    new KvRelationRepository(kvDriver),
  );

  await scan(scanner, configuration.scans);

  if (debugDatabase) {
    const debug: string = await debugDatabaseInformation();
    console.log("Debug database information:", debug);
  }
};

export async function debugDatabaseInformation(): Promise<string> {
  // TODO
  return "TODO";
}

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
