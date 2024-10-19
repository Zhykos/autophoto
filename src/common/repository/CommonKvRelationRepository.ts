import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./entity/VideoGameRelationImageRepositoryEntity.ts";

export class CommonKvRelationRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGameRelation(
    entity: VideoGameRelationImageRepositoryEntity,
  ): Promise<void> {
    await this.kvDriver.save(["relation", entity.uuid], entity);
  }

  async getAllVideoGameRelations(): Promise<
    VideoGameRelationImageRepositoryEntity[]
  > {
    return await this.kvDriver.list(
      ["relation"],
      {} as VideoGameRelationImageRepositoryEntity,
    );
  }

  async updatePublishedStatus(uuid: string): Promise<void> {
    const entity: VideoGameRelationImageRepositoryEntity | undefined =
      await this.kvDriver.get(
        ["relation", uuid],
        {} as VideoGameRelationImageRepositoryEntity,
      );

    if (entity) {
      entity.published = true;
      await this.kvDriver.save(["relation", uuid], entity);
    }
  }
}
