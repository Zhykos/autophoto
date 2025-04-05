import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { ImageRepositoryEntity } from "./entity/ImageRepositoryEntity.ts";

export class CommonKvImageRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGameScreenshots(
    entities: ImageRepositoryEntity[],
  ): Promise<void> {
    for (const entity of entities) {
      await this.kvDriver.save(["image", entity.uuid], entity);
    }
  }

  async getAllVideoGameScreenshots(): Promise<ImageRepositoryEntity[]> {
    return await this.kvDriver.list(["image"], {} as ImageRepositoryEntity);
  }
}
