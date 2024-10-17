import { assertEquals } from "@std/assert";
import type { ImageRepositoryRepositoryEntity } from "../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../src/common/repository/entity/VideoGameRepositoryEntity.ts";
import { main } from "../src/main.ts";
import { pathExists } from "../src/utils/file.ts";
import { getAllImagesFromRepository } from "./test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllImagesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllRelationsFromRepository(tempDatabaseFilePath), []);
}

Deno.test(async function runScan() {
  await beforeEach();

  await main(["config.yml", "--database=./test/it-database.sqlite3", "--scan"]);

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

Deno.test(async function runPublish() {
  await beforeEach();

  await main([
    "config.yml",
    "--database=./test/it-database.sqlite3",
    "--publish",
    "--bluesky_login=login",
    "--bluesky_password=password",
  ]);

  assertEquals("TODO", "DONE"); // TODO check if the files are published
});
