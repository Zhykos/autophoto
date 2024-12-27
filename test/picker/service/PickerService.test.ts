import { assertEquals } from "@std/assert";
import { distinct } from "@std/collections";
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

async function pickEveryPhotos(): Promise<void> {
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
  // Get all video games with at least 1 image to share
  // Randomly pick one of them
  // Repeat

  const kvDriver = new KvDriver(tempDatabaseFilePath);

  try {
    const pickerService = new PickerService(
      new KvRelationRepository(kvDriver),
      new KvVideoGameRepository(kvDriver),
      new KvImageRepository(kvDriver),
    );

    let pick: VideoGameScreeshotsToShare | undefined =
      await pickerService.pick();

    const allPickedImagesNumber: number[] = [];
    const allPickedImagesIDs: string[] = [];
    const allPickedPlatforms: string[] = [];
    const allPickedTitles: string[] = [];

    while (pick) {
      const screenshotsToShare = pick as VideoGameScreeshotsToShare;
      allPickedImagesNumber.push(screenshotsToShare.screenshots.length);

      const allImagesIDs: string[] = screenshotsToShare.screenshots.map(
        (f) => f.id,
      );
      allPickedImagesIDs.push(...allImagesIDs);

      allPickedPlatforms.push(screenshotsToShare.platform);
      allPickedTitles.push(screenshotsToShare.title);

      let linksToPublish: VideoGameRelationImageRepositoryEntity[] = [];

      if (screenshotsToShare.title === "8-Bit Bayonetta") {
        linksToPublish = bayonettaLinks;
      } else if (screenshotsToShare.title === "80's Overdrive") {
        linksToPublish = overdriveLinks;
      } else if (screenshotsToShare.title === "Absolver") {
        linksToPublish = absolverLinks;
      } else if (screenshotsToShare.title === "Control") {
        linksToPublish = controlLinks;
      }

      await publishLinks(
        linksToPublish.filter((l) => allImagesIDs.includes(l.imageID)),
      );

      pick = await pickerService.pick();
    }

    assertEquals(allPickedImagesNumber.length, 6);
    assertEquals(allPickedImagesNumber.sort(), [1, 1, 1, 2, 4, 4]);
    assertEquals(allPickedImagesIDs.length, 13);
    assertEquals(allPickedPlatforms.length, 6);
    assertEquals(allPickedPlatforms.sort(), [
      "Nintendo Switch",
      "PC",
      "PC",
      "PC",
      "PC",
      "PC",
    ]);
    assertEquals(allPickedTitles.length, 6);
    assertEquals(allPickedTitles.sort(), [
      "8-Bit Bayonetta",
      "80's Overdrive",
      "80's Overdrive",
      "Absolver",
      "Control",
      "Control",
    ]);

    assertEquals(await pickerService.pick(), undefined);
  } finally {
    kvDriver.close();
  }
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
