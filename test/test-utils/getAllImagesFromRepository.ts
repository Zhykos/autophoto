import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import { CommonKvImageRepository } from "../../src/common/repository/CommonKvImageRepository.ts";
import type { ImageRepositoryEntity } from "../../src/common/repository/entity/ImageRepositoryEntity.ts";

export async function getAllImagesFromRepository(
  databaseFilePath: string,
): Promise<ImageRepositoryEntity[]> {
  const kvDriver = new KvDriver(databaseFilePath);
  try {
    return await new CommonKvImageRepository(
      kvDriver,
    ).getAllVideoGameScreenshots();
  } finally {
    kvDriver.close();
  }
}
