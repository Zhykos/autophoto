// XXX The fuck? So much imports...
import { crypto } from "@std/crypto/crypto";
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
import { VideoGameEntity } from "../../library/domain/entity/VideoGameEntity.ts";
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

    const links: VideoGameFileLinkEntity[] =
      await this.saveVideoGamesAndCreateLinks(configuration, savedFiles);

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
      const savedFiles: FsFileEntity[] =
        await scanner.scanAndSaveNewFiles(data);
      allSavedFiles.push(...savedFiles);
    }

    return allSavedFiles;
  }

  private async saveVideoGamesAndCreateLinks(
    configuration: Configuration,
    savedFiles: FsFileEntity[],
  ): Promise<VideoGameFileLinkEntity[]> {
    const linksToSave: VideoGameFileLinkEntity[] = [];
    const videoGamesEntitiesToSave: LibraryVideoGameEntity[] = [];

    const allVideoGamesEntities: VideoGameEntity[] =
      await this.libraryRepository.getAllVideoGames();

    for (const scan of configuration.scans) {
      const dirPath: string = scan.directory.rootDir.value;
      console.log(`Get meta data from directory ${dirPath}`);

      for (const fileEntity of savedFiles) {
        const filePath: string = fileEntity.file.path.value;

        const xFileEntity = new XFileEntity(fileEntity.uuid, fileEntity.file);

        const videoGameFromScan: VideoGame = this.mapScanToVideoGame(
          scan,
          filePath,
        );

        const plaform: VideoGamePlatform = this.getVideoGamePlatform(
          scan,
          filePath,
        );

        // XXX Crap: comparing a Value Object with an Entity...
        const videoGameEntity: VideoGameEntity | undefined =
          allVideoGamesEntities.find((vg) =>
            vg.videoGame.equals(videoGameFromScan),
          );

        if (videoGameEntity) {
          linksToSave.push(
            new VideoGameFileLinkEntity(
              new XVideoGameEntity(videoGameFromScan, videoGameEntity.uuid),
              plaform,
              xFileEntity,
            ),
          );
        } else {
          const uuid: string = crypto.randomUUID();

          videoGamesEntitiesToSave.push({
            uuid,
            title: videoGameFromScan.title.value,
            releaseYear: videoGameFromScan.releaseYear.year,
          } satisfies LibraryVideoGameEntity);

          allVideoGamesEntities.push(
            new VideoGameEntity(uuid, videoGameFromScan),
          );

          linksToSave.push(
            new VideoGameFileLinkEntity(
              new XVideoGameEntity(videoGameFromScan, uuid),
              plaform,
              xFileEntity,
            ),
          );
        }
      }
    }

    const libraryService = new LibraryService(this.libraryRepository);
    await libraryService.saveVideoGames(videoGamesEntitiesToSave);

    return linksToSave;
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
