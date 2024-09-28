// XXX The fuck? So much imports...
import { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { Configuration } from "../../configuration/domain/aggregate/Configuration.ts";
import type { ConfigurationScanWithPattern } from "../../configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { ReadConfiguration } from "../../configuration/service/ReadConfiguration.ts";
import { ScanData } from "../../filesystem/domain/aggregate/ScanData.ts";
import type { FileEntity as FsFileEntity } from "../../filesystem/domain/entity/FileEntity.ts";
import { Directory } from "../../filesystem/domain/valueobject/Directory.ts";
import { Path } from "../../filesystem/domain/valueobject/Path.ts";
import {
  type FilesRepository,
  KvFilesRepository,
} from "../../filesystem/repository/FilesRepository.ts";
import { Scanner as FsScanner } from "../../filesystem/service/Scanner.ts";
import {
  VideoGame,
  type VideoGameBuilder,
} from "../../library/domain/valueobject/VideoGame.ts";
import {
  KvLibraryRepository,
  type LibraryRepository,
} from "../../library/repository/LibraryRepository.ts";
import type { VideoGameEntity as LibraryVideoGameEntity } from "../../library/repository/entity/VideoGameEntity.ts";
import { Library as LibraryService } from "../../library/service/Library.ts";
import type { ScanData as XScanData } from "../../x-scanner/domain/aggregate/ScanData.ts";
import { FileEntity as XFileEntity } from "../domain/entity/FileEntity.ts";
import { VideoGameEntity as XVideoGameEntity } from "../domain/entity/VideoGameEntity.ts";
import { VideoGameFileLinkEntity } from "../domain/entity/VideoGameFileLinkEntity.ts";
import type { File as ScannerFile } from "../domain/valueobject/File.ts";
import { VideoGamePlatform } from "../domain/valueobject/VideoGamePlatform.ts";
import {
  KvLinksRepository,
  type LinksRepository,
} from "../repository/LinksRepository.ts";

export class Scanner {
  private kvDriver: KvDriver | undefined;

  private readonly libraryRepository: LibraryRepository;
  private readonly filesRepository: FilesRepository;
  private readonly linksRepository: LinksRepository;
  private readonly configurationFilePath: ScannerFile;

  constructor(scanData: XScanData) {
    this.kvDriver = new KvDriver(scanData.databaseFilePath);
    this.libraryRepository = new KvLibraryRepository(this.kvDriver);
    this.filesRepository = new KvFilesRepository(this.kvDriver);
    this.linksRepository = new KvLinksRepository(this.kvDriver);
    this.configurationFilePath = scanData.configurationFilePath;
  }

  public async scan(): Promise<void> {
    const configuration: Configuration = new ReadConfiguration().load(
      this.configurationFilePath.path.value,
    );

    const savedFiles: FsFileEntity[] =
      await this.scanFilesThenSave(configuration);

    const links: VideoGameFileLinkEntity[] = await this.saveVideoGames(
      configuration,
      savedFiles,
    );

    await this.saveLinks(links);
  }

  private async scanFilesThenSave(
    configuration: Configuration,
  ): Promise<FsFileEntity[]> {
    const scanner = new FsScanner(this.filesRepository);

    const allSavedFiles: FsFileEntity[] = [];

    for (const scan of configuration.scans) {
      const dirPath = scan.directory.rootDir.value;
      console.log(`Scanning ${dirPath}`);

      const directoryToScan = new Directory(new Path(dirPath));

      const data = new ScanData(directoryToScan, scan.pattern.regex);
      const savedFiles: FsFileEntity[] = await scanner.scanAndSave(data);
      allSavedFiles.push(...savedFiles);
    }

    return allSavedFiles;
  }

  private async saveVideoGames(
    configuration: Configuration,
    savedFiles: FsFileEntity[],
  ): Promise<VideoGameFileLinkEntity[]> {
    const links: VideoGameFileLinkEntity[] = [];

    for (const scan of configuration.scans) {
      const dirPath: string = scan.directory.rootDir.value;
      console.log(`Get meta data from directory ${dirPath}`);

      for (const fileEntity of savedFiles) {
        const filePath: string = fileEntity.file.path.value;
        const videoGame: VideoGame = this.mapScanToVideoGame(scan, filePath);

        const existingLink: VideoGameFileLinkEntity | undefined = links.find(
          (link) => link.videoGameEntity.videoGame.equals(videoGame),
        );

        const xFileEntity = new XFileEntity(fileEntity.uuid, fileEntity.file);

        if (existingLink) {
          existingLink.addFile(xFileEntity);
        } else {
          const plaform: VideoGamePlatform = this.getVideoGamePlatform(
            scan,
            filePath,
          );

          links.push(
            new VideoGameFileLinkEntity(
              new XVideoGameEntity(videoGame),
              plaform,
              [xFileEntity],
            ),
          );
        }
      }
    }

    const videoGamesEntities: LibraryVideoGameEntity[] = links.map((link) => {
      return {
        uuid: link.videoGameEntity.uuid,
        title: link.videoGameEntity.videoGame.title.value,
        releaseYear: link.videoGameEntity.videoGame.releaseYear.year,
      } satisfies LibraryVideoGameEntity;
    });

    const libraryService = new LibraryService(this.libraryRepository);
    await libraryService.saveVideoGames(videoGamesEntities);

    return links;
  }

  private mapScanToVideoGame(
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

  private getVideoGamePlatform(
    scan: ConfigurationScanWithPattern,
    completeFilePath: string,
  ): VideoGamePlatform {
    const filePath = completeFilePath
      .replace(scan.directory.rootDir.value, "")
      .substring(1);

    const regexResult = scan.pattern.regex.exec(filePath) as RegExpExecArray;
    const group3: string = regexResult[3];
    return new VideoGamePlatform(group3);
  }

  public destroy(): void {
    this.kvDriver?.close();
  }

  private async saveLinks(links: VideoGameFileLinkEntity[]): Promise<void> {
    // For now we are assuming that we have only video games
    await this.linksRepository.saveVideoGamesLinks(links);
  }
}
