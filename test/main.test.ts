import {
  assert,
  assertEquals,
  assertMatch,
  assertNotEquals,
} from "@std/assert";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@std/testing/bdd";
import type { ImageRepositoryEntity } from "../src/common/repository/entity/ImageRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../src/common/repository/entity/VideoGameRepositoryEntity.ts";
import { main } from "../src/main.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockBlueskyServer } from "./mock/distant-server/MockBlueskyServer.ts";
import { getAllImagesFromRepository } from "./test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("main (root file)", () => {
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
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    const filesAfterScan: ImageRepositoryEntity[] =
      await getAllImagesFromRepository(tempDatabaseFilePath);
    assertEquals(filesAfterScan.length, 5);

    const videoGamesAfterScan: VideoGameRepositoryEntity[] =
      await getAllVideoGamesFromRepository(tempDatabaseFilePath);
    assertEquals(videoGamesAfterScan.length, 2);

    const allLinks: VideoGameRelationImageRepositoryEntity[] =
      await getAllRelationsFromRepository(tempDatabaseFilePath);
    assertEquals(allLinks.length, 5);
  });

  it("should publish images", async () => {
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--scan=./test/resources/config2.yml",
    ]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--publish",
      `--bluesky_host=${mockedBlueskyServer.host}`,
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertNotEquals(mockedBlueskyServer.lastRecord, undefined);
    assertMatch(
      mockedBlueskyServer.lastRecord?.text ?? "",
      /^Screenshots? from video game ".+" \(\d+\) taken on .+$/,
    );
    assert((mockedBlueskyServer.lastRecord?.embed.images.length ?? 0) > 0);
    assertMatch(
      mockedBlueskyServer.lastRecord?.embed.images[0].alt ?? "",
      /^Screenshot from video game .+ \(no more details given by the bot\)$/,
    );
    assertNotEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].image,
      undefined,
    );
  });

  it("should publish stats", async () => {
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--scan=./test/resources/config2.yml",
    ]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--stats",
      `--bluesky_host=${mockedBlueskyServer.host}`,
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertNotEquals(mockedBlueskyServer.lastRecord, undefined);
    assertEquals(
      mockedBlueskyServer.lastRecord?.text ?? "",
      `Hi! ✨ Here are some statistics about the gallery:
  - 8 images
  - 3 video games.

8 images not published yet: it may take more 1 day to publish them.

(automatic message)`,
    );
  });

  it("should not publish images because database is empty", async () => {
    await main([
      `--database=${tempDatabaseFilePath}`,
      "--publish",
      `--bluesky_host=${mockedBlueskyServer.host}`,
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertEquals(mockedBlueskyServer.lastRecord, undefined);
  });

  it("should not publish stats because database is empty", async () => {
    await main([
      `--database=${tempDatabaseFilePath}`,
      "--stats",
      `--bluesky_host=${mockedBlueskyServer.host}`,
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);

    assertEquals(
      mockedBlueskyServer.lastRecord?.text ?? "",
      `Hi! ✨ Here are some statistics about the gallery.
No more images to publish for now.
See you soon 💫

(automatic message)`,
    );
  });
});
