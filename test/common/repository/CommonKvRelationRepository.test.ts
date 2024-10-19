import { assert, assertEquals, assertRejects } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../../../src/common/repository/CommonKvRelationRepository.ts";
import { pathExists } from "../../../src/utils/file.ts";
import { getAllImagesFromRepository } from "../../test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "../../test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "../../test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("CommonKvRelationRepository", () => {
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

  it("should fails during updating an entity which does not exist", async () => {
    const driver = new KvDriver("./test/it-database.sqlite3");

    const repository = new CommonKvRelationRepository(driver);

    try {
      const error = await assertRejects(
        async () => await repository.updatePublishedStatus("foo"),
      );
      assert(error instanceof Error);
      assertEquals(
        error.message,
        'Relation entity with Image ID "foo" not found',
      );
    } finally {
      driver.close();
    }
  });
});
