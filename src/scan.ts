import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ImageDirectory } from "./scanner/domain/aggregate/ImageDirectory.ts";
import type { VideoGame } from "./scanner/domain/entity/VideoGame.ts";
import { VideoGamePlatform } from "./scanner/domain/valueobject/VideoGamePlatform.ts";
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
): Promise<void> => {
  const hasError: boolean = await preScan(configuration);
  if (hasError) {
    console.error("An error occurred while pre-scanning.");
    return;
  }

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

async function preScan(configuration: Configuration): Promise<boolean> {
  console.log("Pre-scan...");

  let filesCount = 0;
  let warningCount = 0;
  let errorsCount = 0;

  for (const scan of configuration.scans) {
    const directory: string = scan.directory.path.value;
    console.log(`Pre-scanning ${directory}...`);

    await scanDirectory(directory, scan.pattern.regex, (filepath) => {
      const regexResult: RegExpExecArray | null =
        scan.pattern.regex.exec(filepath);

      if (regexResult) {
        const group3: string = regexResult[3];
        try {
          new VideoGamePlatform(group3);
          filesCount++;
        } catch (_) {
          console.error(`  - "${filepath}" has an invalid platform: ${group3}`);
          errorsCount++;
        }
      } else {
        warningCount++;
        console.warn(`  - "${filepath}" does not match the pattern.`);
      }
    });
  }

  console.log("Pre-scan completed!");
  console.log(`Found ${filesCount} files.`);
  console.log(`Had ${errorsCount} errors and ${warningCount} warnings.`);

  return errorsCount > 0;
}

async function scanDirectory(
  directory: string,
  pattern: RegExp,
  onFile: (filepath: string) => void,
): Promise<void> {
  for await (const dirEntry of Deno.readDir(directory)) {
    if (dirEntry.isDirectory && dirEntry.name !== "@eaDir") {
      await scanDirectory(`${directory}/${dirEntry.name}`, pattern, onFile);
    } else if (dirEntry.isFile && dirEntry.name !== ".DS_Store") {
      const fullPath = `${directory}/${dirEntry.name}`;
      onFile(fullPath);
    }
  }
}
