import { assertEquals, assertNotEquals } from "@std/assert";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@std/testing/bdd";
import { BlueskyStatsPublisherAction } from "../src/cli/domain/valueobject/BlueskyStatsPublisherAction.ts";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { main } from "../src/main.ts";
import { publishStats } from "../src/publishStats.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockBlueskyServer } from "./mock/distant-server/MockBlueskyServer.ts";
import { mockLogger } from "./mock/logger/mockLogger.ts";
import { getAllImagesFromRepository } from "./test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("publish stats (root file)", () => {
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
  });

  afterAll(async () => {
    await mockedBlueskyServer.stop();
  });

  it("should publish stats", async () => {
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--scan=./test/resources/config2.yml",
    ]);

    const driver = new KvDriver(tempDatabaseFilePath);

    try {
      const action = new BlueskyStatsPublisherAction(
        new URL(mockedBlueskyServer.host),
        "login",
        "password",
      );

      action.debug = true;

      const result: string | undefined = await publishStats(
        action,
        driver,
        mockLogger(),
      );

      assertNotEquals(mockedBlueskyServer.lastRecord, undefined);

      assertEquals(
        mockedBlueskyServer.lastRecord?.text ?? "",
        `Hi! ✨ Here are some statistics about the gallery:
  - 8 images
  - 3 video games.

8 images not published yet: it may take more 1 day to publish them.

(automatic message)`,
      );

      assertNotEquals(result, undefined);
    } finally {
      driver.close();
    }
  });

  it("should not publish stats", async () => {
    const driver = new KvDriver(tempDatabaseFilePath);

    try {
      const action = new BlueskyStatsPublisherAction(
        new URL(mockedBlueskyServer.host),
        "login",
        "password",
      );

      action.debug = true;

      const result: string | undefined = await publishStats(
        action,
        driver,
        mockLogger(),
      );
      assertEquals(result, undefined);
    } finally {
      driver.close();
    }
  });
});
