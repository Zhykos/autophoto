import { assertEquals } from "@std/assert";
import { assertNotEquals } from "@std/assert/not-equals";
import type { ImageRepositoryRepositoryEntity } from "../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../src/common/repository/entity/VideoGameRepositoryEntity.ts";
import { main } from "../src/main.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockBlueskyServer } from "./mock/distant-server/MockBlueskyServer.ts";
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

Deno.test(async function runPublishViaMain() {
  await beforeEach();

  await main(["config.yml", "--database=./test/it-database.sqlite3", "--scan"]);

  await main([
    "./test/resources/config2.yml",
    "--database=./test/it-database.sqlite3",
    "--scan",
  ]);

  const mockedBlueskyServer = new MockBlueskyServer(9002);

  try {
    await main([
      "config.yml",
      "--database=./test/it-database.sqlite3",
      "--publish",
      "--bluesky_host=http://localhost:9002",
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertNotEquals(mockedBlueskyServer.lastRecord, undefined);
    assertEquals(
      mockedBlueskyServer.lastRecord?.text,
      'Screenshots from video game "80\'s Overdrive" (2017) taken on Nintendo Switch',
    );
    assertEquals(mockedBlueskyServer.lastRecord?.embed.images.length, 4);
    assertEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].alt,
      "Screenshot from video game 80's Overdrive (no more details given by the bot)",
    );
    assertNotEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].image,
      undefined,
    );
  } finally {
    await mockedBlueskyServer.stop();
  }
});

Deno.test(async function runPublishViaMainButNothingInTheDatabase() {
  await beforeEach();
  const mockedBlueskyServer = new MockBlueskyServer(9003);

  try {
    await main([
      "config.yml",
      "--database=./test/it-database.sqlite3",
      "--publish",
      "--bluesky_host=http://localhost:9003",
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertEquals(mockedBlueskyServer.lastRecord, undefined);
  } finally {
    await mockedBlueskyServer.stop();
  }
});
