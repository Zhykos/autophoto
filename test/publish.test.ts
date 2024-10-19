import { assertEquals, assertNotEquals } from "@std/assert";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@std/testing/bdd";
import { BlueskyCredentials } from "../src/cli/domain/valueobject/BlueskyCredentials.ts";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { main } from "../src/main.ts";
import { debugDatabaseInformation, publish } from "../src/publish.ts";
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
  });

  afterAll(async () => {
    await mockedBlueskyServer.stop();
  });

  it("should publish", async () => {
    await main([
      "config.yml",
      "--database=./test/it-database.sqlite3",
      "--scan",
    ]);

    await main([
      "./test/resources/config2.yml",
      "--database=./test/it-database.sqlite3",
      "--scan",
    ]);

    const driver = new KvDriver("./test/it-database.sqlite3");

    try {
      await publish(
        new BlueskyCredentials(
          new URL(mockedBlueskyServer.host),
          "login",
          "password",
        ),
        driver,
        false,
      );

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
      driver.close();
    }
  });

  it("should debug publication", async () => {
    await main([
      "config.yml",
      "--database=./test/it-database.sqlite3",
      "--scan",
    ]);

    const driver = new KvDriver("./test/it-database.sqlite3");

    try {
      await publish(
        new BlueskyCredentials(
          new URL(mockedBlueskyServer.host),
          "login",
          "password",
        ),
        driver,
        true,
      );

      assertEquals(
        mockedBlueskyServer.lastRecord?.text,
        'Screenshots from video game "80\'s Overdrive" (2017) taken on Nintendo Switch',
      );
      assertEquals(mockedBlueskyServer.lastRecord?.embed.images.length, 3);

      const debug: string = await debugDatabaseInformation();
      assertEquals(
        debug,
        `Publication done for video game "80's Overdrive" (2017 - Nintendo Switch).

        3 images published:
        - Screenshot from video game 80's Overdrive (no more details given by the bot) : test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00001.webp
        - Screenshot from video game 80's Overdrive (no more details given by the bot) : test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00005.webp
        - Screenshot from video game 80's Overdrive (no more details given by the bot) : test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00006.webp

        2 images not published yet: it will take 1 another publication to publish them (if 1 publication per day).`,
      );
    } finally {
      driver.close();
    }
  });
});
