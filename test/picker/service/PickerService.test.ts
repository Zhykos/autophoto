import { unique } from "@radashi-org/radashi";
import { assert, assertEquals } from "@std/assert";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import type { ImageRepositoryRepositoryEntity } from "../../../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRepositoryEntity.ts";
import type { VideoGameScreeshotsToShare } from "../../../src/picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import { KvImageRepository } from "../../../src/picker/repository/ImageRepository.ts";
import { KvRelationRepository } from "../../../src/picker/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "../../../src/picker/repository/VideoGameRepository.ts";
import { PickerService } from "../../../src/picker/service/PickerService.ts";
import { runScanner } from "../../../src/scan.ts";
import { pathExists } from "../../../src/utils/file.ts";
import { getAllImagesFromRepository } from "../../test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "../../test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "../../test-utils/getAllVideoGamesFromRepository.ts";

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

    const possibleTitles1 = ["80's Overdrive", "Control"];
    const possibleLinks1: VideoGameRelationImageRepositoryEntity[] = [
      ...overdriveLinks.filter((l) => l.platform === "Nintendo Switch"),
      ...controlLinks,
    ];
    let possibleLinks1ImageIDs: string[] = possibleLinks1.map((l) => l.imageID);

    assertEquals(possibleLinks1.length, 9);

    const screenshotsPick1: VideoGameScreeshotsToShare =
      (await pickerService.pick()) as VideoGameScreeshotsToShare;
    assertEquals(screenshotsPick1.screenshotsFilesIDs.length, 4);

    const pick1index: number = possibleTitles1.indexOf(screenshotsPick1.title);
    assert(pick1index >= 0);

    if (pick1index === 0) {
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[0],
        ) >= 0 &&
          possibleLinks1ImageIDs.indexOf(
            screenshotsPick1.screenshotsFilesIDs[0],
          ) < 4,
      );
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[1],
        ) >= 0 &&
          possibleLinks1ImageIDs.indexOf(
            screenshotsPick1.screenshotsFilesIDs[1],
          ) < 4,
      );
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[2],
        ) >= 0 &&
          possibleLinks1ImageIDs.indexOf(
            screenshotsPick1.screenshotsFilesIDs[2],
          ) < 4,
      );
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[3],
        ) >= 0 &&
          possibleLinks1ImageIDs.indexOf(
            screenshotsPick1.screenshotsFilesIDs[3],
          ) < 4,
      );

      assertEquals(screenshotsPick1.platform, "Nintendo Switch");
      assertEquals(screenshotsPick1.title, "80's Overdrive");

      possibleTitles1.splice(0, 1);
    } else {
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[0],
        ) >= 4,
      );
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[1],
        ) >= 4,
      );
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[2],
        ) >= 4,
      );
      assert(
        possibleLinks1ImageIDs.indexOf(
          screenshotsPick1.screenshotsFilesIDs[3],
        ) >= 4,
      );

      assertEquals(screenshotsPick1.platform, "PC");
      assertEquals(screenshotsPick1.title, "Control");

      possibleTitles1.splice(1, 1);
    }

    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[0]),
      1,
    );
    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[1]),
      1,
    );
    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[2]),
      1,
    );
    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[3]),
      1,
    );

    possibleLinks1ImageIDs = possibleLinks1.map((l) => l.imageID);

    const screenshotsPick2: VideoGameScreeshotsToShare =
      (await pickerService.pick()) as VideoGameScreeshotsToShare;
    assertEquals(screenshotsPick2.screenshotsFilesIDs.length, 4);
    assertEquals(screenshotsPick2.title, possibleTitles1[0]);
    assertEquals(
      screenshotsPick2.platform,
      possibleTitles1[0] === "80's Overdrive" ? "Nintendo Switch" : "PC",
    );

    assert(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[0]) <
        4,
    );
    assert(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[1]) <
        4,
    );
    assert(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[2]) <
        4,
    );
    assert(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[3]) <
        4,
    );

    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[0]),
      1,
    );
    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[1]),
      1,
    );
    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[2]),
      1,
    );
    possibleLinks1ImageIDs.splice(
      possibleLinks1ImageIDs.indexOf(screenshotsPick1.screenshotsFilesIDs[3]),
      1,
    );

    const screenshotsBayonetta: VideoGameScreeshotsToShare =
      (await pickerService.pick()) as VideoGameScreeshotsToShare;
    assertEquals(screenshotsBayonetta.screenshotsFilesIDs.length, 2);
    assertEquals(screenshotsBayonetta.platform, "PC");
    assertEquals(screenshotsBayonetta.title, "8-Bit Bayonetta");

    const possibleTitles2 = ["80's Overdrive", "Absolver", "Control"];
    const possibleLinks2: VideoGameRelationImageRepositoryEntity[] = [
      overdriveLinks.find(
        (l) => l.platform === "PC",
      ) as VideoGameRelationImageRepositoryEntity,
      absolverLinks[0],
      possibleLinks1[0],
    ];

    const screenshotsPick4: VideoGameScreeshotsToShare =
      (await pickerService.pick()) as VideoGameScreeshotsToShare;
    assertEquals(screenshotsPick4.platform, "PC");
    const pick4index: number = possibleTitles2.indexOf(screenshotsPick4.title);
    assert(pick4index >= 0);
    assertEquals(screenshotsPick4.screenshotsFilesIDs.length, 1);
    assertEquals(
      screenshotsPick4.screenshotsFilesIDs[0],
      possibleLinks2[pick4index].imageID,
    );
    possibleTitles2.splice(pick4index, 1);
    possibleLinks2.splice(pick4index, 1);

    const screenshotsPick5: VideoGameScreeshotsToShare =
      (await pickerService.pick()) as VideoGameScreeshotsToShare;
    assertEquals(screenshotsPick5.platform, "PC");
    const pick5index: number = possibleTitles2.indexOf(screenshotsPick5.title);
    assert(pick5index >= 0);
    assertEquals(screenshotsPick5.screenshotsFilesIDs.length, 1);
    assertEquals(
      screenshotsPick5.screenshotsFilesIDs[0],
      possibleLinks2[pick5index].imageID,
    );
    possibleTitles2.splice(pick5index, 1);
    possibleLinks2.splice(pick5index, 1);

    const screenshotsPick6: VideoGameScreeshotsToShare =
      (await pickerService.pick()) as VideoGameScreeshotsToShare;
    assertEquals(screenshotsPick6.platform, "PC");
    const pick6index: number = possibleTitles2.indexOf(screenshotsPick6.title);
    assert(pick6index >= 0);
    assertEquals(screenshotsPick6.screenshotsFilesIDs.length, 1);
    assertEquals(
      screenshotsPick6.screenshotsFilesIDs[0],
      possibleLinks2[pick6index].imageID,
    );
    possibleTitles2.splice(pick6index, 1);
    possibleLinks2.splice(pick6index, 1);

    assertEquals(possibleTitles2, []);
    assertEquals(possibleLinks2, []);
    assertEquals(await pickerService.pick(), undefined);
  } finally {
    kvDriver.close();
  }
});
