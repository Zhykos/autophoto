import { assertEquals } from "jsr:@std/assert";
import { fileExists } from "../../../src/common/utils/file.ts";
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
  if (fileExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getAllFilesFromDatabase(tempDatabaseFilePath), []);
  assertEquals(await getAllVideoGamesFromDatabase(tempDatabaseFilePath), []);
  assertEquals(await getAllLinksFromDatabase(tempDatabaseFilePath), []);
}

Deno.test(async function scanOk() {
  await beforeEach();

  const scanData = ScanData.builder()
    .withDatabaseFilePath(tempDatabaseFilePath)
    .build();
  const scanner = new Scanner(scanData);

  try {
    await scanner.scan();

    const filesAfterScan: FileEntity[] =
      await getAllFilesFromDatabase(tempDatabaseFilePath);
    filesAfterScan.sort((a, b) => a.path.localeCompare(b.path));
    assertEquals(filesAfterScan.length, 5);

    assertEquals(
      filesAfterScan[0].path,
      "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
    );
    assertEquals(
      filesAfterScan[0].checksum,
      "0c58763a36f41a2c1808fd0f8dc138c21f9fc32eef674c884b286e32658649f902b0d74c7cb4086b9cbcf3871062cfaee96819d7e881e4d1440f16608308c779",
    );

    assertEquals(
      filesAfterScan[2].path,
      "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00001.webp",
    );
    assertEquals(
      filesAfterScan[2].checksum,
      "2d64e06439195fd08c21ad7c0e0fb702d27e66c6795ca9bd3089f19a3e328c2cf79e0491279703294c971dd04942fd0e30316206a18081f88e2ae6067d257a5a",
    );

    const videoGamesAfterScan: VideoGameEntity[] =
      await getAllVideoGamesFromDatabase(tempDatabaseFilePath);
    videoGamesAfterScan.sort((a, b) => a.title.localeCompare(b.title));
    assertEquals(videoGamesAfterScan.length, 2);

    assertEquals(videoGamesAfterScan[0].title, "8-Bit Bayonetta");
    assertEquals(videoGamesAfterScan[0].releaseYear, 2015);

    assertEquals(videoGamesAfterScan[1].title, "80's Overdrive");
    assertEquals(videoGamesAfterScan[1].releaseYear, 2017);
  } finally {
    scanner.destroy();
  }
});

Deno.test(async function scanCheckDuplicates() {
  await beforeEach();

  const scanData = ScanData.builder()
    .withDatabaseFilePath(tempDatabaseFilePath)
    .build();
  const scanner = new Scanner(scanData);

  try {
    await scanner.scan();

    const filesAfterScan: FileEntity[] =
      await getAllFilesFromDatabase(tempDatabaseFilePath);
    assertEquals(filesAfterScan.length, 5);

    const videoGamesAfterScan: VideoGameEntity[] =
      await getAllVideoGamesFromDatabase(tempDatabaseFilePath);
    assertEquals(videoGamesAfterScan.length, 2);

    // Send again the same files

    await scanner.scan();

    const filesAfterScanTwice: FileEntity[] =
      await getAllFilesFromDatabase(tempDatabaseFilePath);
    assertEquals(filesAfterScanTwice.length, 5);

    const videoGamesAfterScanTwice: VideoGameEntity[] =
      await getAllVideoGamesFromDatabase(tempDatabaseFilePath);
    assertEquals(videoGamesAfterScanTwice.length, 2);

    assertEquals(filesAfterScan, filesAfterScanTwice);
    assertEquals(videoGamesAfterScan, videoGamesAfterScanTwice);
  } finally {
    scanner.destroy();
  }
});

Deno.test(async function scanCheckLinks() {
  await beforeEach();

  const scanData = ScanData.builder()
    .withDatabaseFilePath(tempDatabaseFilePath)
    .build();
  const scanner = new Scanner(scanData);

  try {
    await scanner.scan();

    const allLinks: VideoGameFileLinkEntity[] =
      await getAllLinksFromDatabase(tempDatabaseFilePath);
    allLinks.sort((a, b) => a.platform.localeCompare(b.platform));
    assertEquals(allLinks.length, 2);

    const allFiles: FileEntity[] =
      await getAllFilesFromDatabase(tempDatabaseFilePath);
    allFiles.sort((a, b) => a.path.localeCompare(b.path));

    const allVideoGames: VideoGameEntity[] =
      await getAllVideoGamesFromDatabase(tempDatabaseFilePath);
    allVideoGames.sort((a, b) => a.title.localeCompare(b.title));

    assertEquals(allLinks[0].videoGameUUID, allVideoGames[1].uuid);
    assertEquals(allLinks[1].videoGameUUID, allVideoGames[0].uuid);

    assertEquals(allLinks[0].platform, "Nintendo Switch");
    assertEquals(allLinks[1].platform, "PC");

    assertEquals(allLinks[0].filesUUIDs.length, 3);
    assertEquals(allLinks[1].filesUUIDs.length, 2);

    assertEquals(
      [...allLinks[0].filesUUIDs, ...allLinks[1].filesUUIDs].sort(),
      allFiles.map((file) => file.uuid).sort(),
    );
  } finally {
    scanner.destroy();
  }
});

Deno.test(async function scanCheckExistingLinks() {
  await beforeEach();

  const scanData = ScanData.builder()
    .withDatabaseFilePath(tempDatabaseFilePath)
    .build();
  const scanner = new Scanner(scanData);

  try {
    await scanner.scan();
    const allLinks: VideoGameFileLinkEntity[] =
      await getAllLinksFromDatabase(tempDatabaseFilePath);
    assertEquals(allLinks.length, 2);

    // Send again the same files

    await scanner.scan();
    const allLinksTwice: VideoGameFileLinkEntity[] =
      await getAllLinksFromDatabase(tempDatabaseFilePath);
    assertEquals(allLinksTwice.length, 2);

    assertEquals(allLinks, allLinksTwice);
  } finally {
    scanner.destroy();
  }
});
