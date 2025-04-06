import { assertEquals, assertNotEquals, assertRejects } from "@std/assert";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@std/testing/bdd";
import { BlueskyStatsPublisherAction } from "../src/cli/domain/valueobject/BlueskyStatsPublisherAction.ts";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../src/common/repository/CommonKvRelationRepository.ts";
import { CommonKvVideoGameRepository } from "../src/common/repository/CommonKvVideoGameRepository.ts";
import { main } from "../src/main.ts";
import { publishStats, statsDiagrams } from "../src/publishStats.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockBlueskyServer } from "./mock/distant-server/MockBlueskyServer.ts";
import { MockLogger, mockLogger } from "./mock/logger/mockLogger.ts";
import { assertSnapshot } from "./test-utils/assertSnapshot.ts";
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

  it("should publish diagrams", async () => {
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--scan=./test/resources/config2.yml",
    ]);

    const driver = new KvDriver(tempDatabaseFilePath);

    try {
      const relationCommonRepository = new CommonKvRelationRepository(driver);
      const videoGameCommonRepository = new CommonKvVideoGameRepository(driver);

      const diagrams: { images: Uint8Array[]; alts: string[] } =
        await statsDiagrams(
          mockLogger(),
          relationCommonRepository,
          videoGameCommonRepository,
        );

      assertEquals(diagrams.images.length, 3);
      assertEquals(diagrams.alts.length, diagrams.images.length);

      assertEquals(
        diagrams.alts[0],
        `Statistics about this gallery. Video games by platform are:
  - Nintendo Switch: 1 game (or 25%)
  - PC: 3 games (or 75%)`,
      );

      assertEquals(
        diagrams.alts[1],
        `Statistics about this gallery. Video games by original release year are:
  - 2015: 1 game (or 33.333333333333336%)
  - 2017: 2 games (or 66.66666666666667%)`,
      );

      assertEquals(
        diagrams.alts[2],
        `Statistics about this gallery. Video games screenshots by platform are:
  - Nintendo Switch: 4 images (or 50%)
  - PC: 4 images (or 50%)`,
      );

      assertSnapshot(
        diagrams.images[0],
        "./test/resources/snapshots/diagram01.png",
      );

      assertSnapshot(
        diagrams.images[1],
        "./test/resources/snapshots/diagram02.png",
      );

      assertSnapshot(
        diagrams.images[2],
        "./test/resources/snapshots/diagram03.png",
      );
    } finally {
      driver.close();
    }
  });

  it("should publish diagrams with external browser", async () => {
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    const driver = new KvDriver(tempDatabaseFilePath);

    try {
      const relationCommonRepository = new CommonKvRelationRepository(driver);
      const videoGameCommonRepository = new CommonKvVideoGameRepository(driver);
      const logger = new MockLogger();

      await assertRejects(
        async () =>
          await statsDiagrams(
            logger.logger(),
            relationCommonRepository,
            videoGameCommonRepository,
            new URL("http://localhost"),
          ),
      );

      assertEquals(logger.infoMessages, [
        "Using external browser to generate diagram.",
      ]);
    } finally {
      driver.close();
    }
  });
});
