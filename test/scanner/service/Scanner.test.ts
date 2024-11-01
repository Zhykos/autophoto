import { assertEquals } from "@std/assert";
import { distinct } from "@std/collections";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import { Directory } from "../../../src/common/domain/valueobject/Directory.ts";
import { Path } from "../../../src/common/domain/valueobject/Path.ts";
import type { ImageRepositoryRepositoryEntity } from "../../../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGameRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRepositoryEntity.ts";
import { ConfigurationDataPattern } from "../../../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../../../src/configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { DirectoryType } from "../../../src/configuration/domain/valueobject/DirectoryType.ts";
import { scan } from "../../../src/scan.ts";
import { KvImageRepository } from "../../../src/scanner/repository/ImageRepository.ts";
import { KvRelationRepository } from "../../../src/scanner/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "../../../src/scanner/repository/VideoGameRepository.ts";
import { Scanner } from "../../../src/scanner/service/Scanner.ts";
import { pathExists } from "../../../src/utils/file.ts";
import { mockLogger } from "../../mock/logger/mockLogger.ts";
import { getAllImagesFromRepository } from "../../test-utils/getAllImagesFromRepository.ts";
import { getAllRelationsFromRepository } from "../../test-utils/getAllRelationsFromRepository.ts";
import { getAllVideoGamesFromRepository } from "../../test-utils/getAllVideoGamesFromRepository.ts";

const tempDatabaseFilePath = "./test/it-database.sqlite3";

describe("Scanner", () => {
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
  });

  it("should scan then save images into the database", async () => {
    const kvDriver = new KvDriver(tempDatabaseFilePath);

    try {
      const scanner = new Scanner(
        new KvImageRepository(kvDriver, mockLogger()),
        new KvVideoGameRepository(kvDriver),
        new KvRelationRepository(kvDriver),
      );

      await scan(
        scanner,
        [
          new ConfigurationScanWithPattern(
            new Directory(new Path("./test/resources/video-game")),
            DirectoryType["video-game"],
            new ConfigurationDataPattern(/^(.+) \((\d{4})\)\/(.+)\/.+\.webp$/, [
              "title",
              "release-year",
              "platform",
            ]),
          ),
          new ConfigurationScanWithPattern(
            new Directory(new Path("./test/resources/video-game2")),
            DirectoryType["video-game"],
            new ConfigurationDataPattern(/^(.+) \((\d{4})\)\/(.+)\/.+\.webp$/, [
              "title",
              "release-year",
              "platform",
            ]),
          ),
        ],
        mockLogger(),
      );

      const filesAfterScan: ImageRepositoryRepositoryEntity[] =
        await getAllImagesFromRepository(tempDatabaseFilePath);
      filesAfterScan.sort((a, b) => a.path.localeCompare(b.path));
      assertEquals(filesAfterScan.length, 8);
      assertEquals(distinct(filesAfterScan.map((f) => f.uuid)).length, 8);

      assertEquals(
        filesAfterScan[0].path,
        "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
      );
      assertEquals(
        filesAfterScan[0].scanRootDirectory,
        "./test/resources/video-game",
      );
      assertEquals(
        filesAfterScan[0].checksum,
        "0c58763a36f41a2c1808fd0f8dc138c21f9fc32eef674c884b286e32658649f902b0d74c7cb4086b9cbcf3871062cfaee96819d7e881e4d1440f16608308c779",
      );

      assertEquals(
        filesAfterScan[1].path,
        "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00002.webp",
      );
      assertEquals(
        filesAfterScan[1].scanRootDirectory,
        "./test/resources/video-game",
      );
      assertEquals(
        filesAfterScan[1].checksum,
        "5cff1d09a7d77b8a31968f99ab836ca879eca1bdc715acc3b700afa1b4672ebbfb06cc651153bbfb36da4127e2c62b3d61a34568680603c2456a61ba5db0502b",
      );

      assertEquals(
        filesAfterScan[2].path,
        "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00001.webp",
      );
      assertEquals(
        filesAfterScan[2].scanRootDirectory,
        "./test/resources/video-game",
      );
      assertEquals(
        filesAfterScan[2].checksum,
        "2d64e06439195fd08c21ad7c0e0fb702d27e66c6795ca9bd3089f19a3e328c2cf79e0491279703294c971dd04942fd0e30316206a18081f88e2ae6067d257a5a",
      );

      assertEquals(
        filesAfterScan[3].path,
        "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00005.webp",
      );
      assertEquals(
        filesAfterScan[3].scanRootDirectory,
        "./test/resources/video-game",
      );
      assertEquals(
        filesAfterScan[3].checksum,
        "ee89cfb7675343a77fdb33a60136a8a9c249b70f65b1a7e1e50f8f36168f596a0df04b4bea9bf06e447a2b70f602e7f6fe096a4cfa6f24908bf59ac972ccf25d",
      );

      assertEquals(
        filesAfterScan[4].path,
        "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00006.webp",
      );
      assertEquals(
        filesAfterScan[4].scanRootDirectory,
        "./test/resources/video-game",
      );
      assertEquals(
        filesAfterScan[4].checksum,
        "70b9221af25f86617fbf0173f2077af892ae28bb9f43e576988ae2d2f88668cdf48ca976604609627a6bdb0d56426e60576ab715cc44c76989dc2daa180bdeb3",
      );

      assertEquals(
        filesAfterScan[5].path,
        "./test/resources/video-game2/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00027.webp",
      );
      assertEquals(
        filesAfterScan[5].scanRootDirectory,
        "./test/resources/video-game2",
      );
      assertEquals(
        filesAfterScan[5].checksum,
        "1d368d3be9a0786cf1bac4c56fd4872d062a2569ac5145b652b4ce784147fbc06645f563a7d0ad4466e385fc74c38610ad79d058c7f5b3da0ef26a3382eb7bff",
      );

      assertEquals(
        filesAfterScan[6].path,
        "./test/resources/video-game2/80's Overdrive (2017)/PC/80's Overdrive - 00026.webp",
      );
      assertEquals(
        filesAfterScan[6].scanRootDirectory,
        "./test/resources/video-game2",
      );
      assertEquals(
        filesAfterScan[6].checksum,
        "f3fb3dc95549d7d66c13f23a77483df377fc0acc0698db126653dc917d9a577d7cfbed8e91e8fc14f29ed556229693cc0ed6f06f1888ec09446e569f794e13b8",
      );

      assertEquals(
        filesAfterScan[7].path,
        "./test/resources/video-game2/Absolver (2017)/PC/Absolver - 00005.webp",
      );
      assertEquals(
        filesAfterScan[7].scanRootDirectory,
        "./test/resources/video-game2",
      );
      assertEquals(
        filesAfterScan[7].checksum,
        "e745b2cf2aef0dbca633ce1eed82917d051d06e47680b73e832b7db19e29bdd258bdbe41385caa5e1c11ef420f88138ef6126f81afcf6cb593bdfad745ecda70",
      );

      const videoGamesAfterScan: VideoGameRepositoryEntity[] =
        await getAllVideoGamesFromRepository(tempDatabaseFilePath);
      videoGamesAfterScan.sort((a, b) => a.title.localeCompare(b.title));
      assertEquals(videoGamesAfterScan.length, 3);

      assertEquals(videoGamesAfterScan[0].title, "8-Bit Bayonetta");
      assertEquals(videoGamesAfterScan[0].releaseYear, 2015);

      assertEquals(videoGamesAfterScan[1].title, "80's Overdrive");
      assertEquals(videoGamesAfterScan[1].releaseYear, 2017);

      assertEquals(videoGamesAfterScan[2].title, "Absolver");
      assertEquals(videoGamesAfterScan[2].releaseYear, 2017);

      const allLinks: VideoGameRelationImageRepositoryEntity[] =
        await getAllRelationsFromRepository(tempDatabaseFilePath);
      const linksVideoGameIds = distinct(allLinks.map((l) => l.videoGameID));
      assertEquals(allLinks.length, 8);
      assertEquals(new Set(allLinks.map((l) => l.uuid)).size, 8);
      assertEquals(new Set(allLinks.map((l) => l.imageID)).size, 8);
      assertEquals(linksVideoGameIds.length, 3);

      assertEquals(
        videoGamesAfterScan.map((v) => v.uuid).sort(),
        linksVideoGameIds.sort(),
      );

      assertEquals(
        filesAfterScan.map((v) => v.uuid).sort(),
        allLinks.map((l) => l.imageID).sort(),
      );

      assertEquals(allLinks.map((l) => l.platform).sort(), [
        "Nintendo Switch",
        "Nintendo Switch",
        "Nintendo Switch",
        "Nintendo Switch",
        "PC",
        "PC",
        "PC",
        "PC",
      ]);
    } finally {
      kvDriver.close();
    }
  });
});
