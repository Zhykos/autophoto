import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertMatch,
  assertThrows,
} from "jsr:@std/assert";
import { File } from "../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../src/common/domain/valueobject/Path.ts";
import { pathExists } from "../../../src/common/utils/file.ts";
import type { FileEntity } from "../../../src/filesystem/repository/entity/FileEntity.ts";
import type { VideoGameEntity } from "../../../src/library/repository/entity/VideoGameEntity.ts";
import { ScanData } from "../../../src/x-scanner/domain/aggregate/ScanData.ts";
import type { VideoGameFileLinkEntity } from "../../../src/x-scanner/repository/entity/VideoGameFileLinkEntity.ts";
import { Scanner } from "../../../src/x-scanner/service/Scanner.ts";
import { getAllFilesFromDatabase } from "../../common/repository/getAllFilesFromDatabase.ts";
import { getAllLinksFromDatabase } from "../../common/repository/getAllLinksFromDatabase.ts";
import { getAllVideoGamesFromDatabase } from "../../common/repository/getAllVideoGamesFromDatabase.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (pathExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllFilesFromDatabase(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromDatabase(tempDatabaseFilePath), []);
  assertEquals(await getAllLinksFromDatabase(tempDatabaseFilePath), []);
}

Deno.test(async function pick() {
  await beforeEach();

  const scanData = ScanData.builder()
    .withDatabaseFilePath(tempDatabaseFilePath)
    .withConfigurationFilePath(
      new File(new Path("./test/resources/config3.yml")),
    )
    .build();
  const scanner = new Scanner(scanData);

  try {
    await scanner.scan();

    const filesAfterScan: FileEntity[] =
      await getAllFilesFromDatabase(tempDatabaseFilePath);
    assertEquals(filesAfterScan.length, 13);

    const videoGamesAfterScan: VideoGameEntity[] =
      await getAllVideoGamesFromDatabase(tempDatabaseFilePath);
    console.log("videoGamesAfterScan=======", videoGamesAfterScan);
    assertEquals(videoGamesAfterScan.length, 4);

    const allLinks: VideoGameFileLinkEntity[] =
      await getAllLinksFromDatabase(tempDatabaseFilePath);
    assertEquals(allLinks.length, 13);

    //const filesToShare: FilesToShare = new PickerService().pick();
    //assertEquals(filesToShare.files().length, 4);
  } finally {
    scanner.destroy();
  }
});
