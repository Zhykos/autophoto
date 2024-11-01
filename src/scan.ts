import type { Log } from "@cross/log";
import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
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
import { pluralFinalS } from "./utils/plural-final-s.ts";

export const runScanner = async (
  configuration: Configuration,
  kvDriver: KvDriver,
  debugDatabase: boolean,
  logger: Log,
): Promise<void> => {
  const videoGameRepository = new KvVideoGameRepository(kvDriver);
  const relationRepository = new KvRelationRepository(kvDriver);

  const scanner = new Scanner(
    new KvImageRepository(kvDriver),
    videoGameRepository,
    relationRepository,
  );

  await scan(scanner, configuration.scans, logger);

  if (debugDatabase) {
    const debug: string = await debugDatabaseInformation(
      kvDriver.databaseFilePath,
      videoGameRepository,
      relationRepository,
    );
    logger.log("Debug database information:", debug);
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
      allRelations.filter((relation) => relation.videoGameID === videoGame.id);

    const publishedScreenshotsNumber: number = relations.filter(
      (relation) => relation.published,
    ).length;

    return `  - ${videoGame.title.value} (${videoGame.releaseYear.year}) : ${pluralFinalS(relations.length, "screenshot")} (${publishedScreenshotsNumber} already published)`;
  });

  const remainingScreenshotsNumber: number = allRelations.filter(
    (relation) => !relation.published,
  ).length;

  const remainingDays: number = Math.ceil(remainingScreenshotsNumber / 4);

  return `Scanning done and saved in ${databaseFilePath}.

Video games and platforms:
${details.sort().join("\n")}

${pluralFinalS(allRelations.length, "screenshot")} in database, ${remainingScreenshotsNumber} to be published: it may take ${pluralFinalS(remainingDays, "day")} to publish all screenshots (if you execute the command everyday).`;
}

export async function scan(
  scanner: Scanner,
  scanData: ConfigurationScanWithPattern[],
  logger: Log,
): Promise<void> {
  let hasError = false;

  try {
    // TODO Alerting
    for (const scan of scanData) {
      logger.log(`Scanning ${scan.directory.path.value}...`);
      const imageDirectory = new ImageDirectory(
        scan.directory,
        scan.pattern.regex,
        scan.pattern.groups,
      );
      await scanner.scanAndSaveNewImages(imageDirectory);
    }
    logger.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    hasError = true;
    logger.error("An error occurred while scanning.");
    logger.error(error);
  }

  if (hasError) {
    throw new Error("An error occurred while scanning.");
  }
}
