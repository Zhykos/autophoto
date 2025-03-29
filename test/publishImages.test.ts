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
import { BlueskyImagesPublisherAction } from "../src/cli/domain/valueobject/BlueskyImagesPublisherAction.ts";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import { main } from "../src/main.ts";
import { VideoGameScreeshotsToShare } from "../src/picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import { Image } from "../src/picker/domain/entity/Image.ts";
import { UnpublishedVideoGameScreenshotRelation } from "../src/picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";
import type { RelationRepository } from "../src/picker/repository/RelationRepository.ts";
import {
  debugDatabaseInformation,
  publishImages,
} from "../src/publishImages.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockBlueskyServer } from "./mock/distant-server/MockBlueskyServer.ts";
import { mockLogger } from "./mock/logger/mockLogger.ts";
import { getAllImagesFromRepository } from "./test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("publish images (root file)", () => {
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

  it("should publish images", async () => {
    await main([`--database=${tempDatabaseFilePath}`, "--scan=config.yml"]);

    await main([
      `--database=${tempDatabaseFilePath}`,
      "--scan=./test/resources/config2.yml",
    ]);

    const driver = new KvDriver(tempDatabaseFilePath);

    try {
      const action = new BlueskyImagesPublisherAction(
        new URL(mockedBlueskyServer.host),
        "login",
        "password",
      );

      action.debug = true;

      await publishImages(action, driver, mockLogger());

      assertNotEquals(mockedBlueskyServer.lastRecord, undefined);
      assertMatch(
        mockedBlueskyServer.lastRecord?.text ?? "",
        /^Screenshots? from video game ".+" \(\d+\) taken on .+$/,
      );
      const publishedImages: number =
        mockedBlueskyServer.lastRecord?.embed.images.length ?? 0;
      assert(publishedImages > 0);
      assertMatch(
        mockedBlueskyServer.lastRecord?.embed.images[0].alt ?? "",
        /^Screenshot from video game .+ \(no more details given by the bot\)$/,
      );
      assertNotEquals(
        mockedBlueskyServer.lastRecord?.embed.images[0].image,
        undefined,
      );

      const allRelations: VideoGameRelationImageRepositoryEntity[] =
        await getAllRelationsFromRepository(tempDatabaseFilePath);

      assertEquals(allRelations.length, 8);
      assert(allRelations.filter((r) => r.published === true).length > 0);
      assertEquals(
        allRelations.filter((r) => r.published === true).length,
        publishedImages,
      );
    } finally {
      driver.close();
    }
  });

  it("should debug images publication", async () => {
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

  updatePublishedStatuses(_: Image[]): Promise<void> {
    return Promise.resolve();
  }
}
