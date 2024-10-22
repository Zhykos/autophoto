import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../../src/common/repository/CommonKvRelationRepository.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";

export async function publishRelationFromRepository(
  databaseFilePath: string,
  id: string,
): Promise<void> {
  const kvDriver = new KvDriver(databaseFilePath);
  try {
    const relation: VideoGameRelationImageRepositoryEntity | undefined =
      await kvDriver.get(
        ["relation", id],
        {} as VideoGameRelationImageRepositoryEntity,
      );

    if (relation === undefined) {
      const allRelations: VideoGameRelationImageRepositoryEntity[] =
        await new CommonKvRelationRepository(
          kvDriver,
        ).getAllVideoGameRelations();
      throw new Error(
        `No relations found for id: ${id} - All relations IDs: ${allRelations
          .map((rel) => rel.uuid)
          .sort()
          .join(", ")})}`,
      );
    }

    relation.published = true;

    await kvDriver.save(["relation", id], relation);
  } finally {
    kvDriver.close();
  }
}
