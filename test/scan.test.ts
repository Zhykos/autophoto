import { assert, assertEquals, assertRejects } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { Directory } from "../src/common/domain/valueobject/Directory.ts";
import { Path } from "../src/common/domain/valueobject/Path.ts";
import type { Configuration } from "../src/configuration/domain/aggregate/Configuration.ts";
import { ConfigurationDataPattern } from "../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../src/configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { DirectoryType } from "../src/configuration/domain/valueobject/DirectoryType.ts";
import { ConfigurationService } from "../src/configuration/service/ConfigurationService.ts";
import { debugDatabaseInformation, runScanner, scan } from "../src/scan.ts";
import type { VideoGameScreenshot } from "../src/scanner/domain/entity/VideoGameScreenshot.ts";
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
  getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]> {
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

      const debug: string = await debugDatabaseInformation();
      assertEquals(debug, "");
    } finally {
      kvDriver.close();
    }
  });
});
