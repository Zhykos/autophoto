import type { Log } from "@cross/log";
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

  async updatePublishedStatus(imageID: string, logger: Log): Promise<void> {
    const allRelations: VideoGameRelationImageRepositoryEntity[] =
      await this.getAllVideoGameRelations();

    const entity: VideoGameRelationImageRepositoryEntity | undefined =
      allRelations.find((relation) => relation.imageID === imageID);

    if (entity) {
      entity.published = true;
      await this.kvDriver.save(["relation", entity.uuid], entity);
    } else {
      logger.error(
        `Image ID "${imageID}" in relations cannot be found.
Possible entities are: ${(await this.kvDriver.list(["relation"], {} as VideoGameRelationImageRepositoryEntity)).map((e) => `${e.imageID} (rel: ${e.uuid})`).sort()}`,
      );
      throw new Error(`Relation entity with Image ID "${imageID}" not found`);
    }
  }
}
