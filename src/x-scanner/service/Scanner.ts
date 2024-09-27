import { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { Configuration } from "../../configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "../../configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ReadConfiguration } from "../../configuration/service/ReadConfiguration.ts";
import { ScanData } from "../../filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "../../filesystem/domain/valueobject/Directory.ts";
import type { File } from "../../filesystem/domain/valueobject/File.ts";
import { Path } from "../../filesystem/domain/valueobject/Path.ts";
import {
  type FilesRepository,
  KvFilesRepository,
} from "../../filesystem/repository/FilesRepository.ts";
import { Scanner as FsScanner } from "../../filesystem/service/Scanner.ts";
import { Library } from "../../library/domain/aggregate/Library.ts";
import {
  VideoGame,
  type VideoGameBuilder,
} from "../../library/domain/valueobject/VideoGame.ts";
import {
  KvLibraryRepository,
  type LibraryRepository,
} from "../../library/repository/LibraryRepository.ts";
import { Library as LibraryService } from "../../library/service/Library.ts";

export class Scanner {
  private kvDriver: KvDriver | undefined;

  private readonly libraryRepository: LibraryRepository;
  private readonly filesRepository: FilesRepository;

  constructor(
    private readonly configurationFilePath = "./config.yml",
    databaseFilePath = "./db.autophoto.sqlite3",
  ) {
    this.kvDriver = new KvDriver(databaseFilePath);
    this.libraryRepository = new KvLibraryRepository(this.kvDriver);
    this.filesRepository = new KvFilesRepository(this.kvDriver);
  }

  public async scan(): Promise<void> {
    const configuration: Configuration = new ReadConfiguration().load(
      this.configurationFilePath,
    );

    const allFiles: File[] = await this.scanFilesThenSave(configuration);
    await this.saveLibrary(configuration, allFiles);
  }

  private async scanFilesThenSave(
    configuration: Configuration,
  ): Promise<File[]> {
    const scanner = new FsScanner(this.filesRepository);

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
  }

  private async saveLibrary(
    configuration: Configuration,
    allFiles: File[],
  ): Promise<void> {
    const library = new Library();

    for (const scan of configuration.scans) {
      const dirPath = scan.directory.rootDir.value;
      console.log(`Get meta data from directory ${dirPath}`);

      for (const file of allFiles) {
        const videoGame: VideoGame = this.mapScanToLibraryData(
          scan,
          file.path.value,
        );
        library.addVideoGame(videoGame);
      }
    }

    const libraryService = new LibraryService(this.libraryRepository);
    await libraryService.save(library);
  }

  private mapScanToLibraryData(
    scan: ConfigurationScanWithPattern,
    completeFilePath: string,
  ): VideoGame {
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
  }

  public destroy(): void {
    this.kvDriver?.close();
  }
}
