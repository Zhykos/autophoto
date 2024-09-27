import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "./configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ReadConfiguration } from "./configuration/service/ReadConfiguration.ts";
import { ScanData } from "./filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "./filesystem/domain/valueobject/Directory.ts";
import type { File } from "./filesystem/domain/valueobject/File.ts";
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

    const allFiles: File[] = await scanFilesThenSave(configuration, kvDriver);
    await saveLibrary(configuration, allFiles, kvDriver);
  } finally {
    kvDriver.close();
  }
};

const scanFilesThenSave = async (
  configuration: Configuration,
  kvDriver: KvDriver,
): Promise<File[]> => {
  const scanner = new Scanner(new KvFilesRepository(kvDriver));

  const allFiles: File[] = [];

  for (const scan of configuration.scans) {
    const dirPath = scan.directory.rootDir.value;
    console.log(`Scanning ${dirPath}`);

    const directoryToScan = new Directory(new Path(dirPath));

    const data = new ScanData(directoryToScan, scan.pattern.regex);
    const files: File[] = await scanner.scanAndSave(data);
    allFiles.push(...files);
  }

  return allFiles;
};

const saveLibrary = async (
  configuration: Configuration,
  allFiles: File[],
  kvDriver: KvDriver,
): Promise<void> => {
  const library = new Library();

  for (const scan of configuration.scans) {
    const dirPath = scan.directory.rootDir.value;
    console.log(`Get meta data from directory ${dirPath}`);

    for (const file of allFiles) {
      const videoGame: VideoGame = mapScanToLibraryData(scan, file.path.value);
      library.addVideoGame(videoGame);
    }
  }

  const libraryService = new LibraryService(new KvLibraryRepository(kvDriver));
  await libraryService.save(library);
};

const mapScanToLibraryData = (
  scan: ConfigurationScanWithPattern,
  completeFilePath: string,
): VideoGame => {
  const filePath = completeFilePath
    .replace(scan.directory.rootDir.value, "")
    .substring(1);

  const regexResult = scan.pattern.regex.exec(filePath) as RegExpExecArray;

  const group1: string = regexResult[1];
  const group2: string = regexResult[2];
  const group3: string = regexResult[3];

  const builder: VideoGameBuilder = VideoGame.builder();

  if (scan.pattern.groups[0] === "title") {
    builder.withTitle(group1);
  }

  if (scan.pattern.groups[1] === "release-year") {
    builder.withReleaseYear(Number.parseInt(group2));
  }

  if (scan.pattern.groups[2] === "platform") {
    builder.withPlatform(group3);
  }

  return builder.build();
};
