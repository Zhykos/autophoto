import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { publish } from "./publish.ts";
import { ImageDirectory } from "./scanner/domain/aggregate/ImageDirectory.ts";
import type { VideoGame } from "./scanner/domain/entity/VideoGame.ts";
import { KvImageRepository } from "./scanner/repository/ImageRepository.ts";
import {
  KvRelationRepository,
  type RelationRepository,
} from "./scanner/repository/RelationRepository.ts";
import {
  KvVideoGameRepository,
  type VideoGameRepository,
} from "./scanner/repository/VideoGameRepository.ts";
import { Scanner } from "./scanner/service/Scanner.ts";

export const runScanner = async (
  configuration: Configuration,
  kvDriver: KvDriver,
  debugDatabase: boolean,
): Promise<void> => {
  const videoGameRepository = new KvVideoGameRepository(kvDriver);
  const relationRepository = new KvRelationRepository(kvDriver);

  const scanner = new Scanner(
    new KvImageRepository(kvDriver),
    videoGameRepository,
    relationRepository,
  );

  await scan(scanner, configuration.scans);

  if (debugDatabase) {
    const debug: string = await debugDatabaseInformation(
      kvDriver.databaseFilePath,
      videoGameRepository,
      relationRepository,
    );
    console.log("Debug database information:", debug);
  }
};

export async function debugDatabaseInformation(
  databaseFilePath: string,
  videoGameRepository: VideoGameRepository,
  relationRepository: RelationRepository,
): Promise<string> {
  const allVideoGames: VideoGame[] =
    await videoGameRepository.getAllVideoGames();

  const allRelations: VideoGameRelationImageRepositoryEntity[] =
    await relationRepository.getAllRelations();

  const details: string[] = allVideoGames.map((videoGame) => {
    const relations: VideoGameRelationImageRepositoryEntity[] =
      allRelations.filter((relation) => relation.uuid === videoGame.id);

    const publishedScreenshotsNumber: number = relations.filter(
      (relation) => relation.published,
    ).length;

    return `  - ${videoGame.title.value} (${videoGame.releaseYear.year}) : ${relations.length} screenshot${relations.length > 1 ? "s" : ""} (${publishedScreenshotsNumber} already published)`;
  });

  const remainingScreenshotsNumber: number = allRelations.filter(
    (relation) => !relation.published,
  ).length;

  const remainingDays: number = Math.ceil(remainingScreenshotsNumber / 4);

  return `Scanning done and saved in ${databaseFilePath}.

Video games and platforms:
${details.sort().join("\n")}

${allRelations.length} screenshot${allRelations.length > 1 ? "s" : ""} in database, ${remainingScreenshotsNumber} to be published: it may take ${remainingDays} day${remainingDays > 1 ? "s" : ""} to publish all screenshots (if you execute the command everyday).`;
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
