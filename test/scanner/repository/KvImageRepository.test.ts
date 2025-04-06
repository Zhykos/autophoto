import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import type { ImageRepositoryEntity } from "../../../src/common/repository/entity/ImageRepositoryEntity.ts";
import { KvImageRepository } from "../../../src/scanner/repository/ImageRepository.ts";
import { pathExists } from "../../../src/utils/file.ts";
import { MockLogger } from "../../mock/logger/mockLogger.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("KvImageRepository", () => {
  it("should throw an error for wrong checksum", async () => {
    if (pathExists(tempDatabaseFilePath)) {
      Deno.removeSync(tempDatabaseFilePath);
    }

    const logger = new MockLogger();
    const kvDriver = new KvDriver(tempDatabaseFilePath);
    const repository = new KvImageRepository(kvDriver, logger.logger());

    try {
      assertEquals(await repository.getAllVideoGameScreenshots(), []);

      await kvDriver.save(["image", "UUID"], {
        uuid: "UUID",
        scanRootDirectory: "test/resources/video-game",
        path: "test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
        checksum: "toto",
      } satisfies ImageRepositoryEntity);

      await repository.getAllVideoGameScreenshots();

      assertEquals(logger.errorMessages.length, 0);
      assertEquals(logger.infoMessages.length, 0);
      assertEquals(logger.warningMessages.length, 1);
      assertEquals(
        logger.warningMessages[0],
        'Checksum mismatch for file "test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp": expected "toto" (into repository), got "0c58763a36f41a2c1808fd0f8dc138c21f9fc32eef674c884b286e32658649f902b0d74c7cb4086b9cbcf3871062cfaee96819d7e881e4d1440f16608308c779" (from file)',
      );
    } finally {
      kvDriver.close();
    }
  });
});
