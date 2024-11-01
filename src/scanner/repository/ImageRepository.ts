import type { Log } from "@cross/log";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { Directory } from "../../common/domain/valueobject/Directory.ts";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { CommonKvImageRepository } from "../../common/repository/CommonKvImageRepository.ts";
import type { ImageRepositoryRepositoryEntity } from "../../common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import { VideoGameScreenshot } from "../domain/entity/VideoGameScreenshot.ts";
import { Image } from "../domain/valueobject/Image.ts";

export interface ImageRepository {
  saveVideoGameScreenshots(screenshots: VideoGameScreenshot[]): Promise<void>;
  getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]>;
}

export class KvImageRepository implements ImageRepository {
  private readonly commonRepository: CommonKvImageRepository;

  constructor(
    kvDriver: KvDriver,
    private readonly logger: Log,
  ) {
    this.commonRepository = new CommonKvImageRepository(kvDriver);
  }

  async saveVideoGameScreenshots(
    screenshots: VideoGameScreenshot[],
  ): Promise<void> {
    const entities: ImageRepositoryRepositoryEntity[] = screenshots.map(
      (screenshot) => {
        return {
          uuid: screenshot.id,
          scanRootDirectory: screenshot.image.scannerRootDirectory.path.value,
          path: screenshot.image.file.path.value,
          checksum: screenshot.image.file.getChecksum(),
        } satisfies ImageRepositoryRepositoryEntity;
      },
    );

    await this.commonRepository.saveVideoGameScreenshots(entities);
  }

  async getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]> {
    const dbEntities: ImageRepositoryRepositoryEntity[] =
      await this.commonRepository.getAllVideoGameScreenshots();

    return dbEntities.map((dbEntity) => {
      const file = new File(new Path(dbEntity.path));

      let toUpdate = false;
      const repositoryChecksum: string = file.getChecksum();
      if (repositoryChecksum !== dbEntity.checksum) {
        toUpdate = true;
        this.logger.warn(
          `Checksum mismatch for file "${file.path.value}": expected "${dbEntity.checksum}" (into repository), got "${repositoryChecksum}" (from file)`,
        );
      }

      return new VideoGameScreenshot(
        new Image(new Directory(new Path(dbEntity.scanRootDirectory)), file),
        dbEntity.uuid,
        toUpdate,
      );
    });
  }
}
