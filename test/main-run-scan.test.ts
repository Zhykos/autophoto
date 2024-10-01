import { assertEquals } from "jsr:@std/assert";
import { pathExists } from "../src/common/utils/file.ts";
import type { FileEntity } from "../src/filesystem/repository/entity/FileEntity.ts";
import type { VideoGameEntity } from "../src/library/repository/entity/VideoGameEntity.ts";
import type { VideoGameFileLinkEntity } from "../src/x-scanner/repository/entity/VideoGameFileLinkEntity.ts";
import { getAllFilesFromDatabase } from "./common/repository/getAllFilesFromDatabase.ts";
import { getAllLinksFromDatabase } from "./common/repository/getAllLinksFromDatabase.ts";
import { getAllVideoGamesFromDatabase } from "./common/repository/getAllVideoGamesFromDatabase.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllFilesFromDatabase(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromDatabase(tempDatabaseFilePath), []);
  assertEquals(await getAllLinksFromDatabase(tempDatabaseFilePath), []);
}

Deno.test(async function noArgs() {
  await beforeEach();

  await import("../src/main-run-scan.ts");

  const filesAfterScan: FileEntity[] =
    await getAllFilesFromDatabase(tempDatabaseFilePath);
  assertEquals(filesAfterScan.length, 5);

  const videoGamesAfterScan: VideoGameEntity[] =
    await getAllVideoGamesFromDatabase(tempDatabaseFilePath);
  assertEquals(videoGamesAfterScan.length, 2);

  const allLinks: VideoGameFileLinkEntity[] =
    await getAllLinksFromDatabase(tempDatabaseFilePath);
  assertEquals(allLinks.length, 5);
});
