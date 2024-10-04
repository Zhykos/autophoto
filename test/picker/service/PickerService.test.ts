import { assertEquals } from "@std/assert";
import { unique } from "@radashi-org/radashi";
import { pathExists } from "../../../src/common/utils/file.ts";
import { runScanner } from "../../../src/scan.ts";
import type { ImageRepositoryRepositoryEntity } from "../../../src/scanner/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../../src/scanner/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../../../src/scanner/repository/entity/VideoGameRepositoryEntity.ts";
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

Deno.test(async function pick() {
  await beforeEach();

  await runScanner([
    `--database=${tempDatabaseFilePath}`,
    "./test/resources/config3.yml",
  ]);

  const filesAfterScan: ImageRepositoryRepositoryEntity[] =
    await getAllImagesFromRepository(tempDatabaseFilePath);
  filesAfterScan.sort((a, b) => a.path.localeCompare(b.path));
  assertEquals(filesAfterScan.length, 13);

  const videoGamesAfterScan: VideoGameRepositoryEntity[] =
    await getAllVideoGamesFromRepository(tempDatabaseFilePath);
  assertEquals(videoGamesAfterScan.length, 4);
  assertEquals(videoGamesAfterScan.map((vg) => vg.title).sort(), [
    "8-Bit Bayonetta",
    "80's Overdrive",
    "Absolver",
    "Control",
  ]);

  const allLinks: VideoGameRelationImageRepositoryEntity[] =
    await getAllRelationsFromRepository(tempDatabaseFilePath);
  assertEquals(allLinks.length, 13);

  // ============= 2 images for 8-Bit Bayonetta on PC =============
  const bayonetta: VideoGameRepositoryEntity = videoGamesAfterScan.find(
    (vg) => vg.title === "8-Bit Bayonetta",
  ) as VideoGameRepositoryEntity;
  const bayonettaLinks: VideoGameRelationImageRepositoryEntity[] =
    allLinks.filter((link) => link.videoGameID === bayonetta.uuid);
  assertEquals(bayonettaLinks.length, 2);
  assertEquals(unique(bayonettaLinks.map((l) => l.platform)), ["PC"]);

  // ============= 1 image for 80's Overdrive on PC =============
  // ============= 4 images for 80's Overdrive on Switch =============
  const overdrive: VideoGameRepositoryEntity = videoGamesAfterScan.find(
    (vg) => vg.title === "80's Overdrive",
  ) as VideoGameRepositoryEntity;
  const overdriveLinks: VideoGameRelationImageRepositoryEntity[] =
    allLinks.filter((link) => link.videoGameID === overdrive.uuid);
  assertEquals(overdriveLinks.map((l) => l.platform).sort(), [
    "Nintendo Switch",
    "Nintendo Switch",
    "Nintendo Switch",
    "Nintendo Switch",
    "PC",
  ]);

  // ============= 1 image for Absolver on PC =============
  const absolver: VideoGameRepositoryEntity = videoGamesAfterScan.find(
    (vg) => vg.title === "Absolver",
  ) as VideoGameRepositoryEntity;
  const absolverLinks: VideoGameRelationImageRepositoryEntity[] =
    allLinks.filter((link) => link.videoGameID === absolver.uuid);
  assertEquals(absolverLinks.length, 1);
  assertEquals(
    absolverLinks.map((l) => l.platform),
    ["PC"],
  );

  // ============= 5 images for Control on PC =============
  const control: VideoGameRepositoryEntity = videoGamesAfterScan.find(
    (vg) => vg.title === "Control",
  ) as VideoGameRepositoryEntity;
  const controlLinks: VideoGameRelationImageRepositoryEntity[] =
    allLinks.filter((link) => link.videoGameID === control.uuid);
  assertEquals(controlLinks.length, 5);
  assertEquals(unique(controlLinks.map((l) => l.platform)), ["PC"]);

  //const filesToShare: FilesToShare = new PickerService().pick();
  //assertEquals(filesToShare.files().length, 4);
});
