import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./entity/VideoGameRelationImageRepositoryEntity.ts";

export class CommonKvRelationRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGameRelation(
    entity: VideoGameRelationImageRepositoryEntity,
  ): Promise<void> {
    await this.kvDriver.save(["relation", entity.uuid], entity);
  }
}
