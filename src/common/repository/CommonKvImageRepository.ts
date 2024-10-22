import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { ImageRepositoryRepositoryEntity } from "./entity/ImageRepositoryRepositoryEntity.ts";

export class CommonKvImageRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGameScreenshots(
    entities: ImageRepositoryRepositoryEntity[],
  ): Promise<void> {
    for (const entity of entities) {
      await this.kvDriver.save(["image", entity.uuid], entity);
    }
  }

  async getAllVideoGameScreenshots(): Promise<
    ImageRepositoryRepositoryEntity[]
  > {
    return await this.kvDriver.list(
      ["image"],
      {} as ImageRepositoryRepositoryEntity,
    );
  }
}
