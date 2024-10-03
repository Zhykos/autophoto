import { assert, assertEquals, assertRejects } from "@std/assert";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import { pathExists } from "../../../src/common/utils/file.ts";
import { KvImageRepository } from "../../../src/scanner/repository/ImageRepository.ts";
import type { ImageRepositoryRepositoryEntity } from "../../../src/scanner/repository/entity/ImageRepositoryRepositoryEntity.ts";
import { getAllImagesFromRepository } from "../../common/repository/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "../../common/repository/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "../../common/repository/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllImagesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllRelationsFromRepository(tempDatabaseFilePath), []);
}

Deno.test(async function wrongChecksum() {
  await beforeEach();

  const kvDriver = new KvDriver(tempDatabaseFilePath);
  const repository = new KvImageRepository(kvDriver);

  try {
    await kvDriver.save(["image", "UUID"], {
      uuid: "UUID",
      scanRootDirectory: "test/resources/video-game",
      path: "test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
      checksum: "toto",
    } satisfies ImageRepositoryRepositoryEntity);

    const error = await assertRejects(async () => {
      await repository.getAllVideoGameScreenshots();
    });

    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Checksum mismatch for file "test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp": expected "toto" (into repository), got "0c58763a36f41a2c1808fd0f8dc138c21f9fc32eef674c884b286e32658649f902b0d74c7cb4086b9cbcf3871062cfaee96819d7e881e4d1440f16608308c779" (from file)',
    );
  } finally {
    kvDriver.close();
  }
});
