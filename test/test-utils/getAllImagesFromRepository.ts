import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import { CommonKvImageRepository } from "../../src/common/repository/CommonKvImageRepository.ts";
import type { ImageRepositoryRepositoryEntity } from "../../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";

export async function getAllImagesFromRepository(
  databaseFilePath: string,
): Promise<ImageRepositoryRepositoryEntity[]> {
  const kvDriver = new KvDriver(databaseFilePath);
  try {
    return await new CommonKvImageRepository(
      kvDriver,
    ).getAllVideoGameScreenshots();
  } finally {
    kvDriver.close();
  }
}
