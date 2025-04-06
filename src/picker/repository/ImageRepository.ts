import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { CommonKvImageRepository } from "../../common/repository/CommonKvImageRepository.ts";
import type { ImageRepositoryEntity } from "../../common/repository/entity/ImageRepositoryEntity.ts";
import { Image } from "../domain/entity/Image.ts";

export interface ImageRepository {
  getVideoGameScreenshots(filterIDs: string[]): Promise<Image[]>;
  count(): Promise<number>;
}

export class KvImageRepository implements ImageRepository {
  private readonly commonRepository: CommonKvImageRepository;

  constructor(kvDriver: KvDriver) {
    this.commonRepository = new CommonKvImageRepository(kvDriver);
  }

  async getVideoGameScreenshots(filterIDs: string[]): Promise<Image[]> {
    const entities: ImageRepositoryEntity[] =
      await this.commonRepository.getAllVideoGameScreenshots();

    return entities
      .filter((entity) => filterIDs.includes(entity.uuid))
      .map((entity) => {
        return new Image(entity.uuid, entity.path);
      });
  }

  async count(): Promise<number> {
    const entities: ImageRepositoryEntity[] =
      await this.commonRepository.getAllVideoGameScreenshots();
    return entities.length;
  }
}
