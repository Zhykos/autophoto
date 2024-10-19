import { assert, assertEquals, assertRejects } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { Directory } from "../src/common/domain/valueobject/Directory.ts";
import { Path } from "../src/common/domain/valueobject/Path.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { Configuration } from "../src/configuration/domain/aggregate/Configuration.ts";
import { ConfigurationDataPattern } from "../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../src/configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { DirectoryType } from "../src/configuration/domain/valueobject/DirectoryType.ts";
import { ConfigurationService } from "../src/configuration/service/ConfigurationService.ts";
import { debugDatabaseInformation, runScanner, scan } from "../src/scan.ts";
import { VideoGame } from "../src/scanner/domain/entity/VideoGame.ts";
import type { VideoGameScreenshot } from "../src/scanner/domain/entity/VideoGameScreenshot.ts";
import type { VideoGamePlatform } from "../src/scanner/domain/valueobject/VideoGamePlatform.ts";
import { VideoGameReleaseYear } from "../src/scanner/domain/valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../src/scanner/domain/valueobject/VideoGameTitle.ts";
import type { RelationRepository } from "../src/scanner/repository/RelationRepository.ts";
import type { VideoGameRepository } from "../src/scanner/repository/VideoGameRepository.ts";
import { Scanner } from "../src/scanner/service/Scanner.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockImageRepository } from "./mock/repository/MockImageRepository.ts";
import { MockRelationRepository } from "./mock/repository/MockRelationRepository.ts";
import { MockVideoGameRepository } from "./mock/repository/MockVideoGameRepository.ts";
import { getAllImagesFromRepository } from "./test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

class MockErrorImageRepository extends MockImageRepository {
  override getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]> {
    throw new Error("MockErrorImageRepository.getAllVideoGameScreenshots");
  }
}

describe("main scanner", () => {
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

  it("should fails during scan", async () => {
    const scanner = new Scanner(
      new MockErrorImageRepository(),
      new MockVideoGameRepository(),
      new MockRelationRepository(),
    );

    const scanData = new ConfigurationScanWithPattern(
      new Directory(new Path("src")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/foo/, []),
    );

    const error = await assertRejects(
      async () => await scan(scanner, [scanData]),
    );

    assert(error instanceof Error);
    assertEquals(error.message, "An error occurred while scanning.");
  });

  it("should debug scan", async () => {
    const kvDriver = new KvDriver(tempDatabaseFilePath);

    try {
      const configuration: Configuration = new ConfigurationService().loadFile(
        "./test/resources/config3.yml",
      );
      await runScanner(configuration, kvDriver, true);

      const debug: string = await debugDatabaseInformation(
        tempDatabaseFilePath,
        new MockDebugVideoGameRepository(),
        new MockDebugRelationRepository(),
      );
      assertEquals(
        debug,
        `Scanning done and saved in ${tempDatabaseFilePath}.

Video games and platforms:
  - 8-Bit Bayonetta (2015) : 2 screenshots (0 already published)
  - 80's Overdrive (2017) : 4 screenshots (1 already published)

6 screenshots in database, 5 to be published: it may take 2 days to publish all screenshots (if you execute the command everyday).`,
      );
    } finally {
      kvDriver.close();
    }
  });
});

class MockDebugVideoGameRepository implements VideoGameRepository {
  saveVideoGames(_: VideoGame[]): Promise<void> {
    return Promise.resolve();
  }

  getAllVideoGames(): Promise<VideoGame[]> {
    return Promise.resolve([
      new VideoGame(
        new VideoGameTitle("80's Overdrive"),
        new VideoGameReleaseYear(2017),
        "80's Overdrive",
      ),
      new VideoGame(
        new VideoGameTitle("8-Bit Bayonetta"),
        new VideoGameReleaseYear(2015),
        "8-Bit Bayonetta",
      ),
    ]);
  }
}

class MockDebugRelationRepository implements RelationRepository {
  saveVideoGameRelation(
    _1: VideoGame,
    _2: VideoGameScreenshot,
    _3: VideoGamePlatform,
  ): Promise<void> {
    return Promise.resolve();
  }

  getAllRelations(): Promise<VideoGameRelationImageRepositoryEntity[]> {
    return Promise.resolve([
      {
        uuid: "8-Bit Bayonetta",
        videoGameID: "8-Bit Bayonetta",
        platform: "string",
        imageID: "string",
        published: false,
      } satisfies VideoGameRelationImageRepositoryEntity,
      {
        uuid: "8-Bit Bayonetta",
        videoGameID: "8-Bit Bayonetta",
        platform: "string",
        imageID: "string",
        published: false,
      } satisfies VideoGameRelationImageRepositoryEntity,
      {
        uuid: "80's Overdrive",
        videoGameID: "80's Overdrive",
        platform: "string",
        imageID: "string",
        published: false,
      } satisfies VideoGameRelationImageRepositoryEntity,
      {
        uuid: "80's Overdrive",
        videoGameID: "80's Overdrive",
        platform: "string",
        imageID: "string",
        published: false,
      } satisfies VideoGameRelationImageRepositoryEntity,
      {
        uuid: "80's Overdrive",
        videoGameID: "80's Overdrive",
        platform: "string",
        imageID: "string",
        published: true,
      } satisfies VideoGameRelationImageRepositoryEntity,
      {
        uuid: "80's Overdrive",
        videoGameID: "80's Overdrive",
        platform: "string",
        imageID: "string",
        published: false,
      } satisfies VideoGameRelationImageRepositoryEntity,
    ]);
  }
}
