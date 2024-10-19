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
import { VideoGameScreeshotsToShare } from "../src/picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import { Image } from "../src/picker/domain/entity/Image.ts";
import { UnpublishedVideoGameScreenshotRelation } from "../src/picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";
import type { RelationRepository } from "../src/picker/repository/RelationRepository.ts";
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

  it.skip("should publish", async () => {
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
    const relationRepository = new MockRelationRepository();

    const debug: string = await debugDatabaseInformation(
      new VideoGameScreeshotsToShare(
        "80's Overdrive",
        "Nintendo Switch",
        2017,
        [
          new Image(
            "uuid1",
            "test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00001.webp",
          ),
        ],
      ),
      relationRepository,
    );
    assertEquals(
      debug,
      `Publication done for video game "80's Overdrive" (2017 - Nintendo Switch).

1 image published:
  - test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00001.webp

2 images not published yet: it may take another 1 publication to publish them (if 1 publication per day).`,
    );
  });
});

class MockRelationRepository implements RelationRepository {
  getUnpublishedVideoGameRelations(): Promise<
    UnpublishedVideoGameScreenshotRelation[]
  > {
    return Promise.resolve([
      new UnpublishedVideoGameScreenshotRelation(
        "uuid1",
        "image1",
        "game1",
        "",
      ),
      new UnpublishedVideoGameScreenshotRelation(
        "uuid2",
        "image2",
        "game2",
        "",
      ),
    ]);
  }

  updatePublishedStatuses(_: string[]): Promise<void> {
    return Promise.resolve();
  }
}
