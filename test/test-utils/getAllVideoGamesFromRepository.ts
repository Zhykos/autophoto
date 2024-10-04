import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import { CommonKvVideoGameRepository } from "../../src/common/repository/CommonKvVideoGameRepository.ts";
import type { VideoGameRepositoryEntity } from "../../src/common/repository/entity/VideoGameRepositoryEntity.ts";

export async function getAllVideoGamesFromRepository(
  databaseFilePath: string,
): Promise<VideoGameRepositoryEntity[]> {
  const kvDriver = new KvDriver(databaseFilePath);
  try {
    return await new CommonKvVideoGameRepository(kvDriver).getAllVideoGames();
  } finally {
    kvDriver.close();
  }
}
