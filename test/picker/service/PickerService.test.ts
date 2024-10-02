import { assertEquals } from "jsr:@std/assert";
import { pathExists } from "../../../src/common/utils/file.ts";
import { runScanner, scan } from "../../../src/run-scan.ts";
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

  await runScanner(
    [`--database=${tempDatabaseFilePath}`, "./test/resources/config3.yml"],
    async (_, scanner, configuration) => {
      await scan(scanner, configuration.scans);
    },
  );

  const filesAfterScan: ImageRepositoryRepositoryEntity[] =
    await getAllImagesFromRepository(tempDatabaseFilePath);
  console.log("filesAfterScan=============", filesAfterScan);
  assertEquals(filesAfterScan.length, 13);

  const videoGamesAfterScan: VideoGameRepositoryEntity[] =
    await getAllVideoGamesFromRepository(tempDatabaseFilePath);
  assertEquals(videoGamesAfterScan.length, 4);

  const allLinks: VideoGameRelationImageRepositoryEntity[] =
    await getAllRelationsFromRepository(tempDatabaseFilePath);
  assertEquals(allLinks.length, 13);

  //const filesToShare: FilesToShare = new PickerService().pick();
  //assertEquals(filesToShare.files().length, 4);
});
