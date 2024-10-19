import { assertEquals } from "@std/assert";
import { assertNotEquals } from "@std/assert/not-equals";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@std/testing/bdd";
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

describe("main publish", () => {
  let mockedBlueskyServer: MockBlueskyServer;

  beforeAll(() => {
    mockedBlueskyServer = new MockBlueskyServer(1312);
  });

  beforeEach(async () => {
    if (pathExists(tempDatabaseFilePath)) {
      Deno.removeSync(tempDatabaseFilePath);
    }

    assertEquals(await getAllImagesFromRepository(tempDatabaseFilePath), []);
    assertEquals(
      await getAllVideoGamesFromRepository(tempDatabaseFilePath),
      [],
    );
    assertEquals(await getAllRelationsFromRepository(tempDatabaseFilePath), []);

    mockedBlueskyServer.reset();
  });

  afterAll(async () => {
    await mockedBlueskyServer.stop();
  });

  it("should scan", async () => {
    await main(["config.yml", `--database=${tempDatabaseFilePath}`, "--scan"]);

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

  it("should publish", async () => {
    await main(["config.yml", `--database=${tempDatabaseFilePath}`, "--scan"]);

    await main([
      "./test/resources/config2.yml",
      `--database=${tempDatabaseFilePath}`,
      "--scan",
    ]);

    await main([
      "config.yml",
      `--database=${tempDatabaseFilePath}`,
      "--publish",
      `--bluesky_host=${mockedBlueskyServer.host}`,
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
  });

  it("should publish nothing because database is empty", async () => {
    await main([
      "config.yml",
      `--database=${tempDatabaseFilePath}`,
      "--publish",
      `--bluesky_host=${mockedBlueskyServer.host}`,
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertEquals(mockedBlueskyServer.lastRecord, undefined);
  });
});
