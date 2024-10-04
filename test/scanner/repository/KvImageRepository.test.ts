import { assert, assertEquals, assertRejects } from "@std/assert";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import type { ImageRepositoryRepositoryEntity } from "../../../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import { KvImageRepository } from "../../../src/scanner/repository/ImageRepository.ts";
import { pathExists } from "../../../src/utils/file.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

Deno.test(async function wrongChecksum() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  const kvDriver = new KvDriver(tempDatabaseFilePath);
  const repository = new KvImageRepository(kvDriver);

  try {
    assertEquals(await repository.getAllVideoGameScreenshots(), []);

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
