import { assertEquals } from "@std/assert";
import { pathExists } from "../src/common/utils/file.ts";
import type { ImageRepositoryRepositoryEntity } from "../src/scanner/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../src/scanner/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../src/scanner/repository/entity/VideoGameRepositoryEntity.ts";
import { getAllImagesFromRepository } from "./common/repository/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./common/repository/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./common/repository/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllImagesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllRelationsFromRepository(tempDatabaseFilePath), []);
}

Deno.test(async function noArgs() {
  await beforeEach();

  await import("../src/main-run-scan.ts");

  const filesAfterScan: ImageRepositoryRepositoryEntity[] =
    await getAllImagesFromRepository(tempDatabaseFilePath);
  assertEquals(filesAfterScan.length, 5);

  const videoGamesAfterScan: VideoGameRepositoryEntity[] =
    await getAllVideoGamesFromRepository(tempDatabaseFilePath);
  assertEquals(videoGamesAfterScan.length, 2);

  const allLinks: VideoGameRelationImageRepositoryEntity[] =
    await getAllRelationsFromRepository(tempDatabaseFilePath);
  assertEquals(allLinks.length, 5);
});
