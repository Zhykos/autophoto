import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { VideoGameScreenshot } from "../domain/entity/VideoGameScreenshot.ts";
import { Image } from "../domain/valueobject/Image.ts";
import type { ImageRepositoryRepositoryEntity } from "./entity/ImageRepositoryRepositoryEntity.ts";

export interface ImageRepository {
  saveVideoGameScreenshots(screenshots: VideoGameScreenshot[]): Promise<void>;
  getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]>;
}

export class KvImageRepository implements ImageRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGameScreenshots(
    screenshots: VideoGameScreenshot[],
  ): Promise<void> {
    const entities: ImageRepositoryRepositoryEntity[] = screenshots.map(
      (screenshot) => {
        return {
          uuid: screenshot.id,
          path: screenshot.image.file.path.value,
          checksum: screenshot.image.file.getChecksum(),
        } satisfies ImageRepositoryRepositoryEntity;
      },
    );

    for (const entity of entities) {
      await this.kvDriver.save(["image", entity.uuid], entity);
    }
  }

  async getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]> {
    const entities: ImageRepositoryRepositoryEntity[] =
      await this.kvDriver.list(
        ["image"],
        {} as ImageRepositoryRepositoryEntity,
      );

    return entities.map((entity) => {
      const file = new File(new Path(entity.path));

      const repositoryChecksum: string = file.getChecksum();
      if (repositoryChecksum !== entity.checksum) {
        throw new Error(
          `Checksum mismatch for file "${file.path.value}": expected "${entity.checksum}", got "${repositoryChecksum}"`,
        );
      }

      return new VideoGameScreenshot(new Image(file), entity.uuid);
    });
  }
}
