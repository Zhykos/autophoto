import { assertEquals } from "jsr:@std/assert";
import { fileExists } from "../src/common/utils/file.ts";
import type { FileEntity } from "../src/filesystem/repository/entity/FileEntity.ts";
import type { VideoGameEntity } from "../src/library/repository/entity/VideoGameEntity.ts";
import { scan } from "../src/scan.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

async function beforeEach() {
  if (fileExists(tempDatabaseFilePath)) {
    Deno.removeSync(tempDatabaseFilePath);
  }

  assertEquals(await getFilesFromDatabase(), []);
  assertEquals(await getVideoGamesFromDatabase(), []);
}

async function getFilesFromDatabase(): Promise<FileEntity[]> {
  const result: FileEntity[] = [];
  const kv = await Deno.openKv(tempDatabaseFilePath);
  const entries = kv.list({ prefix: ["file"] });
  for await (const entry of entries) {
    const encoder = new TextDecoder();
    const fileData = encoder.decode(entry.value as BufferSource);
    result.push(JSON.parse(fileData) as FileEntity);
  }
  kv.close();
  return result;
}

async function getVideoGamesFromDatabase(): Promise<VideoGameEntity[]> {
  const result: VideoGameEntity[] = [];
  const kv = await Deno.openKv(tempDatabaseFilePath);
  const entries = kv.list({ prefix: ["library", "video-game"] });
  for await (const entry of entries) {
    const encoder = new TextDecoder();
    const fileData = encoder.decode(entry.value as BufferSource);
    result.push(JSON.parse(fileData) as VideoGameEntity);
  }
  kv.close();
  return result;
}

Deno.test(async function scanOk() {
  await beforeEach();

  await scan("config.yml", tempDatabaseFilePath);

  const filesAfterScan: FileEntity[] = await getFilesFromDatabase();
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
    await getVideoGamesFromDatabase();
  videoGamesAfterScan.sort((a, b) => a.title.localeCompare(b.title));
  assertEquals(videoGamesAfterScan.length, 2);

  assertEquals(videoGamesAfterScan[0].title, "8-Bit Bayonetta");
  assertEquals(videoGamesAfterScan[0].releaseYear, 2015);

  assertEquals(videoGamesAfterScan[1].title, "80's Overdrive");
  assertEquals(videoGamesAfterScan[1].releaseYear, 2017);
});
