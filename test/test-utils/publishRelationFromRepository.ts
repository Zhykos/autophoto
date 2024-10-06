import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";

export async function publishRelationFromRepository(
  databaseFilePath: string,
  id: string,
): Promise<void> {
  const kvDriver = new KvDriver(databaseFilePath);
  try {
    const relations: VideoGameRelationImageRepositoryEntity[] =
      await kvDriver.list(
        ["relation", id],
        {} as VideoGameRelationImageRepositoryEntity,
      );

    if (relations.length === 0) {
      throw new Error(`No relations found for id: ${id}`);
    }

    if (relations.length > 1) {
      throw new Error(`Multiple relations found for id: ${id}`);
    }

    relations[0].published = true;

    await kvDriver.save(["relation", id], relations[0]);
  } finally {
    kvDriver.close();
  }
}
