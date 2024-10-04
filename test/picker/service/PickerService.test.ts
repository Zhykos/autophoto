import { unique } from "@radashi-org/radashi";
import { assert, assertEquals } from "@std/assert";
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

  // ============= Check picker ===================================
  // ============= 1) 4/5 images for Control on PC ================
  // ============= 2) 4/4 images for 80's Overdrive on Switch =====
  // ============= 3) 2/2 images for 8-Bit Bayonetta on PC ========
  // ============= 4) 1/1 remaining image  for Control on PC ======
  // ============= 4) OR 1/1 image for 80's Overdrive on PC =======
  // ============= 4) OR 1/1 image for Absolver on PC =============
  // ============= 5) and 6) Randomly chose remaining images ======
  // ============= 13 images in total =============================

  const pickerService = new PickerService();

  const screenshotsControl: VideoGameScreeshotsToShare =
    pickerService.pick() as VideoGameScreeshotsToShare;
  assertEquals(screenshotsControl.files.length, 4);
  assertEquals(screenshotsControl.platform.length, "PC");
  assertEquals(screenshotsControl.title, "Control");

  const screenshotsOverdriveSwitch: VideoGameScreeshotsToShare =
    pickerService.pick() as VideoGameScreeshotsToShare;
  assertEquals(screenshotsOverdriveSwitch.files.length, 4);
  assertEquals(screenshotsOverdriveSwitch.platform.length, "Nintendo Switch");
  assertEquals(screenshotsOverdriveSwitch.title, "80's Overdrive");

  const screenshotsBayonetta: VideoGameScreeshotsToShare =
    pickerService.pick() as VideoGameScreeshotsToShare;
  assertEquals(screenshotsBayonetta.files.length, 2);
  assertEquals(screenshotsBayonetta.platform.length, "PC");
  assertEquals(screenshotsBayonetta.title, "8-Bit Bayonetta");

  const possibleTitles = ["80's Overdrive", "Absolver", "Control"];
  const possibleLinks: VideoGameRelationImageRepositoryEntity[] = [
    overdriveLinks.find(
      (l) => l.platform === "PC",
    ) as VideoGameRelationImageRepositoryEntity,
    absolverLinks[0],
    controlLinks.find(
      (l) =>
        !screenshotsOverdriveSwitch.files
          .map((f) => f.uuid)
          .includes(l.imageID),
    ) as VideoGameRelationImageRepositoryEntity,
  ];

  const screenshotsPick4: VideoGameScreeshotsToShare =
    pickerService.pick() as VideoGameScreeshotsToShare;
  assertEquals(screenshotsPick4.platform, "PC");
  const pick4index: number = possibleTitles.indexOf(screenshotsPick4.title);
  assert(pick4index >= 0);
  assertEquals(screenshotsPick4.files.length, 1);
  assertEquals(
    screenshotsPick4.files[0].uuid,
    possibleLinks[pick4index].imageID,
  );
  possibleTitles.splice(pick4index, 1);
  possibleLinks.splice(pick4index, 1);

  const screenshotsPick5: VideoGameScreeshotsToShare =
    pickerService.pick() as VideoGameScreeshotsToShare;
  assertEquals(screenshotsPick5.platform, "PC");
  const pick5index: number = possibleTitles.indexOf(screenshotsPick5.title);
  assert(pick5index >= 0);
  assertEquals(screenshotsPick5.files.length, 1);
  assertEquals(
    screenshotsPick5.files[0].uuid,
    possibleLinks[pick5index].imageID,
  );
  possibleTitles.splice(pick5index, 1);
  possibleLinks.splice(pick5index, 1);

  const screenshotsPick6: VideoGameScreeshotsToShare =
    pickerService.pick() as VideoGameScreeshotsToShare;
  assertEquals(screenshotsPick6.platform, "PC");
  const pick6index: number = possibleTitles.indexOf(screenshotsPick6.title);
  assert(pick6index >= 0);
  assertEquals(screenshotsPick6.files.length, 1);
  assertEquals(
    screenshotsPick6.files[0].uuid,
    possibleLinks[pick6index].imageID,
  );
  possibleTitles.splice(pick6index, 1);
  possibleLinks.splice(pick6index, 1);

  assertEquals(possibleTitles, []);
  assertEquals(possibleLinks, []);
  assertEquals(pickerService.pick(), undefined);
});
