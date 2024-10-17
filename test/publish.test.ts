import { assertEquals } from "@std/assert";
import { BlueskyCredentials } from "../src/cli/domain/valueobject/BlueskyCredentials.ts";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { publish } from "../src/publish.ts";
import { pathExists } from "../src/utils/file.ts";
import { getAllImagesFromRepository } from "./test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "./test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "./test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllImagesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromRepository(tempDatabaseFilePath), []);
  assertEquals(await getAllRelationsFromRepository(tempDatabaseFilePath), []);
}

Deno.test(async function runPublish() {
  await beforeEach();

  const driver = new KvDriver("./test/it-database.sqlite3");

  try {
    await publish(new BlueskyCredentials("login", "password"), driver);

    assertEquals("TODO", "DONE"); // TODO check if the files are published
  } finally {
    driver.close();
  }
});
