import { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { Configuration } from "../../configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "../../configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ReadConfiguration } from "../../configuration/service/ReadConfiguration.ts";
import { ScanData } from "../../filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "../../filesystem/domain/valueobject/Directory.ts";
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
import { ScanData as XScanData } from "../../x-scanner/domain/aggregate/ScanData.ts";
import type { File as ScannerFile } from "../domain/valueobject/File.ts";

export class Scanner {
  private kvDriver: KvDriver | undefined;

  private readonly libraryRepository: LibraryRepository;
  private readonly filesRepository: FilesRepository;
  private readonly configurationFilePath: ScannerFile;

  constructor(scanData?: XScanData) {
    let data: XScanData | undefined = scanData;
    if (!data) {
      data = XScanData.builder().build();
    }

    this.kvDriver = new KvDriver(data.databaseFilePath);
    this.libraryRepository = new KvLibraryRepository(this.kvDriver);
    this.filesRepository = new KvFilesRepository(this.kvDriver);
    this.configurationFilePath = data.configurationFilePath;
  }

  public async scan(): Promise<void> {
    const configuration: Configuration = new ReadConfiguration().load(
      this.configurationFilePath.path.value,
    );

    const allFiles: ScannerFile[] = await this.scanFilesThenSave(configuration);
    await this.saveLibrary(configuration, allFiles);
  }

  private async scanFilesThenSave(
    configuration: Configuration,
  ): Promise<ScannerFile[]> {
    const scanner = new FsScanner(this.filesRepository);

    const allFiles: ScannerFile[] = [];

    for (const scan of configuration.scans) {
      const dirPath = scan.directory.rootDir.value;
      console.log(`Scanning ${dirPath}`);

      const directoryToScan = new Directory(new Path(dirPath));

      const data = new ScanData(directoryToScan, scan.pattern.regex);
      const files: ScannerFile[] = await scanner.scanAndSave(data);
      allFiles.push(...files);
    }

    return allFiles;
  }

  private async saveLibrary(
    configuration: Configuration,
    allFiles: ScannerFile[],
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
    await libraryService.saveVideoGames(library.getVideoGames());
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

    const builder: VideoGameBuilder = VideoGame.builder();

    if (scan.pattern.groups[0] === "title") {
      builder.withTitle(group1);
    }

    if (scan.pattern.groups[1] === "release-year") {
      builder.withReleaseYear(Number.parseInt(group2));
    }

    return builder.build();
  }

  public destroy(): void {
    this.kvDriver?.close();
  }
}
