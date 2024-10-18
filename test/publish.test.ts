import { assertEquals, assertNotEquals } from "@std/assert";
import { BlueskyCredentials } from "../src/cli/domain/valueobject/BlueskyCredentials.ts";
import { KvDriver } from "../src/common/dbdriver/KvDriver.ts";
import { main } from "../src/main.ts";
import { publish } from "../src/publish.ts";
import { pathExists } from "../src/utils/file.ts";
import { MockBlueskyServer } from "./mock/distant-server/MockBlueskyServer.ts";
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

  await main(["config.yml", "--database=./test/it-database.sqlite3", "--scan"]);

  await main([
    "./test/resources/config2.yml",
    "--database=./test/it-database.sqlite3",
    "--scan",
  ]);

  const mockedBlueskyServer = new MockBlueskyServer(9004);

  const driver = new KvDriver("./test/it-database.sqlite3");

  try {
    await publish(
      new BlueskyCredentials(
        new URL("http://localhost:9004"),
        "login",
        "password",
      ),
      driver,
    );

    assertNotEquals(mockedBlueskyServer.lastRecord, undefined);
    assertEquals(
      mockedBlueskyServer.lastRecord?.text,
      'Screenshots from video game "80\'s Overdrive" (2017) taken on Nintendo Switch',
    );
    assertEquals(mockedBlueskyServer.lastRecord?.embed.images.length, 4);
    assertEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].alt,
      'Screenshots from video game "80\'s Overdrive" (2017) taken on Nintendo Switch (no more details given by the bot)',
    );
    assertNotEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].image,
      undefined,
    );
  } finally {
    driver.close();
    await mockedBlueskyServer.stop();
  }
});
