import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { distinct, withoutAll } from "@std/collections";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import type { ImageRepositoryRepositoryEntity } from "../../../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRepositoryEntity.ts";
import type { Configuration } from "../../../src/configuration/domain/aggregate/Configuration.ts";
import { ConfigurationService } from "../../../src/configuration/service/ConfigurationService.ts";
import type { VideoGameScreeshotsToShare } from "../../../src/picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import { KvImageRepository } from "../../../src/picker/repository/ImageRepository.ts";
import { KvRelationRepository } from "../../../src/picker/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "../../../src/picker/repository/VideoGameRepository.ts";
import { PickerService } from "../../../src/picker/service/PickerService.ts";
import { runScanner } from "../../../src/scan.ts";
import { pathExists } from "../../../src/utils/file.ts";
import { mockLogger } from "../../mock/logger/mockLogger.ts";
import { getAllImagesFromRepository } from "../../test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "../../test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "../../test-utils/getAllVideoGamesFromRepository.ts";
import { publishRelationFromRepository } from "../../test-utils/publishRelationFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("PickerService", () => {
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

    const kvDriver = new KvDriver(tempDatabaseFilePath);
    try {
      const configuration: Configuration = new ConfigurationService().loadFile(
        "./test/resources/config3.yml",
      );
      await runScanner(configuration, kvDriver, false, mockLogger());
    } finally {
      kvDriver.close();
    }
  });

  // Due to the random nature of the picker, we need to run it several times.

  it("should pick correct photos - execution 01", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 02", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 03", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 04", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 05", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 06", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 07", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 08", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 09", async () => {
    await pickEveryPhotos();
  });

  it("should pick correct photos - execution 10", async () => {
    await pickEveryPhotos();
  });
});

async function pickEveryPhotos() {
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
  assertEquals(distinct(bayonettaLinks.map((l) => l.platform)), ["PC"]);

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
  assertEquals(distinct(controlLinks.map((l) => l.platform)), ["PC"]);

  // ============= Check picker ===================================
  // ============= 1) and 2) 4/5 images for Control on PC =========
  // ============= OR 4/4 images for 80's Overdrive on Switch =====
  // ============= 3) 2/2 images for 8-Bit Bayonetta on PC ========
  // ============= 4) 1/1 remaining image  for Control on PC ======
  // ============= 4) OR 1/1 image for 80's Overdrive on PC =======
  // ============= 4) OR 1/1 image for Absolver on PC =============
  // ============= 5) and 6) Randomly chose remaining images ======
  // ============= 13 images in total =============================
  // Get all video games with at least 4 images to share
  // Randomly pick one of them
  // Repeat
  // If no video game with at least 4 images to share, get other video games
  // Sort by number of images to share, take the one with the most images to share
  // If equal, randomly pick one
  // Repeat

  const kvDriver = new KvDriver(tempDatabaseFilePath);

  try {
    const pickerService = new PickerService(
      new KvRelationRepository(kvDriver),
      new KvVideoGameRepository(kvDriver),
      new KvImageRepository(kvDriver),
    );

    const unusedControlImage: VideoGameRelationImageRepositoryEntity =
      await pick1And2(pickerService, overdriveLinks, controlLinks);
    await pick3Bayonetta(pickerService, bayonettaLinks);
    await pick4and5and6(
      pickerService,
      overdriveLinks.find(
        (l) => l.platform === "PC",
      ) as VideoGameRelationImageRepositoryEntity,
      absolverLinks[0],
      unusedControlImage,
    );

    assertEquals(await pickerService.pick(), undefined);
  } finally {
    kvDriver.close();
  }
}

async function pick1And2(
  pickerService: PickerService,
  allOverdriveLinks: VideoGameRelationImageRepositoryEntity[],
  controlLinks: VideoGameRelationImageRepositoryEntity[],
): Promise<VideoGameRelationImageRepositoryEntity> {
  const possibleTitles = ["80's Overdrive", "Control"];
  const overdriveLinks: VideoGameRelationImageRepositoryEntity[] =
    allOverdriveLinks.filter((l) => l.platform === "Nintendo Switch");

  assertEquals(overdriveLinks.length, 4);
  assertEquals(controlLinks.length, 5);

  const screenshotsPick1: VideoGameScreeshotsToShare =
    (await pickerService.pick()) as VideoGameScreeshotsToShare;
  assertEquals(screenshotsPick1.screenshots.length, 4);

  const pick1index: number = possibleTitles.indexOf(screenshotsPick1.title);
  assert(pick1index >= 0);

  let unusedControlImage: VideoGameRelationImageRepositoryEntity | undefined =
    undefined;

  if (pick1index === 0) {
    await pickOverdriveSwitch(overdriveLinks, screenshotsPick1);
    possibleTitles.splice(0, 1);
  } else {
    unusedControlImage = await pickControl(controlLinks, screenshotsPick1);
    possibleTitles.splice(1, 1);
  }

  const screenshotsPick2: VideoGameScreeshotsToShare =
    (await pickerService.pick()) as VideoGameScreeshotsToShare;
  assertEquals(screenshotsPick2.screenshots.length, 4);
  assertEquals(screenshotsPick2.title, possibleTitles[0]);

  if (pick1index === 0) {
    unusedControlImage = await pickControl(controlLinks, screenshotsPick2);
  } else {
    await pickOverdriveSwitch(overdriveLinks, screenshotsPick2);
  }

  return unusedControlImage as VideoGameRelationImageRepositoryEntity;
}

async function pickOverdriveSwitch(
  possibleLinksImageIDs: VideoGameRelationImageRepositoryEntity[],
  pick: VideoGameScreeshotsToShare,
): Promise<void> {
  console.log("80s Overdrive Switch picked");

  assertEquals(
    pick.screenshots.map((s) => s.id).sort(),
    possibleLinksImageIDs.map((l) => l.imageID).sort(),
  );
  assertEquals(pick.platform, "Nintendo Switch");
  assertEquals(pick.title, "80's Overdrive");

  await publishLinks(possibleLinksImageIDs);
}

async function pickControl(
  possibleLinksImageIDs: VideoGameRelationImageRepositoryEntity[],
  pick: VideoGameScreeshotsToShare,
): Promise<VideoGameRelationImageRepositoryEntity> {
  console.log("Control picked");

  const notUsedImageIds: string[] = withoutAll(
    possibleLinksImageIDs.map((l) => l.imageID),
    pick.screenshots.map((l) => l.id),
  );

  assertEquals(notUsedImageIds.length, 1);
  assert(
    possibleLinksImageIDs.map((l) => l.imageID).includes(notUsedImageIds[0]),
  );

  assertEquals(pick.platform, "PC");
  assertEquals(pick.title, "Control");

  const linksToPublish: VideoGameRelationImageRepositoryEntity[] =
    possibleLinksImageIDs.filter((l) => l.imageID !== notUsedImageIds[0]);
  assertEquals(linksToPublish.length, 4);

  await publishLinks(linksToPublish);

  return possibleLinksImageIDs.find(
    (l) => l.imageID === notUsedImageIds[0],
  ) as VideoGameRelationImageRepositoryEntity;
}

async function pick3Bayonetta(
  pickerService: PickerService,
  bayonettaLinks: VideoGameRelationImageRepositoryEntity[],
): Promise<void> {
  const screenshotsBayonetta: VideoGameScreeshotsToShare =
    (await pickerService.pick()) as VideoGameScreeshotsToShare;
  assertEquals(screenshotsBayonetta.screenshots.length, 2);
  assertEquals(
    screenshotsBayonetta.screenshots.map((f) => f.id).sort(),
    bayonettaLinks.map((l) => l.imageID).sort(),
  );
  assertEquals(screenshotsBayonetta.platform, "PC");
  assertEquals(screenshotsBayonetta.title, "8-Bit Bayonetta");
  await publishLinks(bayonettaLinks);
}

async function pick4and5and6(
  pickerService: PickerService,
  overdriveLink: VideoGameRelationImageRepositoryEntity,
  absolverLink: VideoGameRelationImageRepositoryEntity,
  controlLink: VideoGameRelationImageRepositoryEntity,
) {
  const possibleTitles = ["80's Overdrive", "Absolver", "Control"];

  const screenshotsPick4: VideoGameScreeshotsToShare =
    (await pickerService.pick()) as VideoGameScreeshotsToShare;
  const pick4index: number = possibleTitles.indexOf(screenshotsPick4.title);
  assert(pick4index >= 0);

  if (pick4index === 0) {
    await pickOverdrivePC(overdriveLink, screenshotsPick4);
  } else if (pick4index === 1) {
    await pickAbsolver(absolverLink, screenshotsPick4);
  } else {
    await pickRemainingControl(controlLink, screenshotsPick4);
  }

  const screenshotsPick5: VideoGameScreeshotsToShare =
    (await pickerService.pick()) as VideoGameScreeshotsToShare;
  const pick5index: number = possibleTitles.indexOf(screenshotsPick5.title);
  assert(pick5index >= 0);
  assertNotEquals(pick5index, pick4index);

  if (pick5index === 0) {
    await pickOverdrivePC(overdriveLink, screenshotsPick5);
  } else if (pick5index === 1) {
    await pickAbsolver(absolverLink, screenshotsPick5);
  } else {
    await pickRemainingControl(controlLink, screenshotsPick5);
  }

  const screenshotsPick6: VideoGameScreeshotsToShare =
    (await pickerService.pick()) as VideoGameScreeshotsToShare;
  const pick6index: number = possibleTitles.indexOf(screenshotsPick6.title);
  assert(pick6index >= 0);
  assertNotEquals(pick6index, pick4index);
  assertNotEquals(pick6index, pick5index);

  if (pick6index === 0) {
    await pickOverdrivePC(overdriveLink, screenshotsPick6);
  } else if (pick6index === 1) {
    await pickAbsolver(absolverLink, screenshotsPick6);
  } else {
    await pickRemainingControl(controlLink, screenshotsPick6);
  }
}

async function pickOverdrivePC(
  possibleLink: VideoGameRelationImageRepositoryEntity,
  pick: VideoGameScreeshotsToShare,
): Promise<void> {
  console.log("80s Overdrive PC picked");
  assertEquals(pick.screenshots.length, 1);
  assertEquals(pick.screenshots[0].id, possibleLink.imageID);
  assertEquals(pick.platform, "PC");
  assertEquals(pick.title, "80's Overdrive");
  await publishLink(possibleLink);
}

async function pickAbsolver(
  possibleLink: VideoGameRelationImageRepositoryEntity,
  pick: VideoGameScreeshotsToShare,
): Promise<void> {
  console.log("Absolver picked");
  assertEquals(pick.screenshots.length, 1);
  assertEquals(pick.screenshots[0].id, possibleLink.imageID);
  assertEquals(pick.platform, "PC");
  assertEquals(pick.title, "Absolver");
  await publishLink(possibleLink);
}

async function pickRemainingControl(
  controlLink: VideoGameRelationImageRepositoryEntity,
  pick: VideoGameScreeshotsToShare,
): Promise<void> {
  console.log("Control picked");
  assertEquals(pick.screenshots.length, 1);
  assertEquals(pick.screenshots[0].id, controlLink.imageID);
  assertEquals(pick.platform, "PC");
  assertEquals(pick.title, "Control");
  await publishLink(controlLink);
}

async function publishLinks(
  links: VideoGameRelationImageRepositoryEntity[],
): Promise<void> {
  for (const link of links) {
    await publishLink(link);
  }
}

async function publishLink(
  link: VideoGameRelationImageRepositoryEntity,
): Promise<void> {
  await publishRelationFromRepository(tempDatabaseFilePath, link.uuid);
}
