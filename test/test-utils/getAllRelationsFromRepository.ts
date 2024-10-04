import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../../src/common/repository/CommonKvRelationRepository.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";

export async function getAllRelationsFromRepository(
  databaseFilePath: string,
): Promise<VideoGameRelationImageRepositoryEntity[]> {
  const kvDriver = new KvDriver(databaseFilePath);
  try {
    return await new CommonKvRelationRepository(
      kvDriver,
    ).getAllVideoGameRelations();
  } finally {
    kvDriver.close();
  }
}
