import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Directory } from "../src/common/domain/valueobject/Directory.ts";
import { Path } from "../src/common/domain/valueobject/Path.ts";
import { Configuration } from "../src/configuration/domain/aggregate/Configuration.ts";
import { ConfigurationDataPattern } from "../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../src/configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { DirectoryType } from "../src/configuration/domain/valueobject/DirectoryType.ts";
import { ConfigurationService } from "../src/configuration/service/ConfigurationService.ts";
import { main } from "../src/main.ts";
import { preScan } from "../src/prescan.ts";

describe("main prescan", () => {
  it("should prescan with main", async () => {
    const result: boolean = await main([
      "config.yml",
      "--database=./test/it-database.sqlite3",
      "--prescan=config.yml",
    ]);

    assert(result);
  });

  it("should prescan", () => {
    const configuration: Configuration = new ConfigurationService().loadFile(
      "config.yml",
    );

    const result: {
      filesCount: number;
      errorsCount: number;
    } = preScan(configuration);

    assertEquals(result.filesCount, 5);
    assertEquals(result.errorsCount, 0);
  });

  it("should fails with wrong pattern", () => {
    const pattern = new ConfigurationScanWithPattern(
      new Directory(new Path("./test/resources/video-game")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/a/, ["a"]),
    );
    const scans: ConfigurationScanWithPattern[] = [pattern];
    const configuration: Configuration = new Configuration(scans);

    const result: {
      filesCount: number;
      errorsCount: number;
    } = preScan(configuration);

    assertEquals(result.filesCount, 0);
    assertEquals(result.errorsCount, 1);
  });

  it("should fails with unknown platform", () => {
    const pattern = new ConfigurationScanWithPattern(
      new Directory(new Path("./test/resources/video-game4")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/^(.+) \((\d{4})\)\/(.+)\/.+\.webp$/, [
        "title",
        "year",
        "platform",
      ]),
    );
    const scans: ConfigurationScanWithPattern[] = [pattern];
    const configuration: Configuration = new Configuration(scans);

    const result: {
      filesCount: number;
      errorsCount: number;
    } = preScan(configuration);

    assertEquals(result.filesCount, 0);
    assertEquals(result.errorsCount, 1);
  });
});
