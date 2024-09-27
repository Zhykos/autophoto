import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationDataPattern } from "./configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ReadConfiguration } from "./configuration/service/ReadConfiguration.ts";
import { ScanData } from "./filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "./filesystem/domain/valueobject/Directory.ts";
import { Path } from "./filesystem/domain/valueobject/Path.ts";
import { KvFilesRepository } from "./filesystem/repository/FilesRepository.ts";
import { Scanner } from "./filesystem/service/Scanner.ts";
import { Library } from "./library/domain/aggregate/Library.ts";
import {
  VideoGame,
  type VideoGameBuilder,
} from "./library/domain/valueobject/VideoGame.ts";
import { KvLibraryRepository } from "./library/repository/LibraryRepository.ts";
import { Library as LibraryService } from "./library/service/Library.ts";

export const scan = async (
  configurationFilePath = "./config.yml",
  databaseFilePath = "./db.autophoto.sqlite3",
): Promise<void> => {
  const kvDriver = new KvDriver(databaseFilePath);

  try {
    const configuration: Configuration = new ReadConfiguration().load(
      configurationFilePath,
    );

    await scanFilesThenSave(configuration, kvDriver);
    await saveLibrary(configuration, kvDriver);
  } finally {
    kvDriver.close();
  }
};

const scanFilesThenSave = async (
  configuration: Configuration,
  kvDriver: KvDriver,
): Promise<void> => {
  const scanner = new Scanner(new KvFilesRepository(kvDriver));

  for (const scan of configuration.scans) {
    const dirPath = scan.directory.rootDir.value;
    console.log(`Scanning ${dirPath}`);

    const directoryToScan = new Directory(new Path(dirPath));

    const data = new ScanData(directoryToScan, scan.pattern.regex);
    await scanner.scanAndSave(data);
  }
};

const saveLibrary = async (
  configuration: Configuration,
  kvDriver: KvDriver,
): Promise<void> => {
  const library = new Library();

  for (const scan of configuration.scans) {
    const dirPath = scan.directory.rootDir.value;
    console.log(`Get meta data from directory ${dirPath}`);

    const regexResult: RegExpExecArray | null =
      scan.pattern.regex.exec(dirPath);

    if (regexResult === null) {
      console.error(`No meta data found from regex for directory "${dirPath}"`);
      continue;
    }

    const videoGame: VideoGame = mapScanToLibraryData(
      scan.pattern,
      regexResult,
    );
    library.addVideoGame(videoGame);
  }

  const libraryService = new LibraryService(new KvLibraryRepository(kvDriver));
  await libraryService.save(library);
};

const mapScanToLibraryData = (
  scanPattern: ConfigurationDataPattern,
  regexResult: RegExpExecArray,
): VideoGame => {
  const group1: string = regexResult[1];
  const group2: string = regexResult[2];
  const group3: string = regexResult[3];

  const builder: VideoGameBuilder = VideoGame.builder();

  if (scanPattern.groups[0] === "title") {
    builder.withTitle(group1);
  }

  if (scanPattern.groups[1] === "release-year") {
    builder.withReleaseYear(Number.parseInt(group2));
  }

  if (scanPattern.groups[2] === "platform") {
    builder.withPlatform(group3);
  }

  return builder.build();
};
