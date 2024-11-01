import { Log } from "@cross/log";
import { assert, assertEquals, assertFalse } from "@std/assert";
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
import { MockLoggerTransport } from "./mock/logger/MockLoggerTransport.ts";
import { assertContainsMatch } from "./test-utils/assertContainsMatch.ts";

describe("main prescan", () => {
  it("should prescan with main", async () => {
    const result: boolean = await main(["--prescan=config.yml"]);

    assert(result);
  });

  it("should prescan", () => {
    const configuration: Configuration = new ConfigurationService().loadFile(
      "config.yml",
    );
    const loggerTransport = new MockLoggerTransport();

    const result: boolean = preScan(configuration, new Log([loggerTransport]));

    assert(result);
    assertEquals(loggerTransport.logMessages.length, 4);
    assertEquals(loggerTransport.errorMessages.length, 0);
    assertContainsMatch(
      loggerTransport.logMessages,
      /Pre-scanning .+\/video-game\.\.\./,
    );
  });

  it("should fails with wrong pattern", () => {
    const pattern = new ConfigurationScanWithPattern(
      new Directory(new Path("./test/resources/video-game")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/a/, ["a"]),
    );
    const scans: ConfigurationScanWithPattern[] = [pattern];
    const configuration: Configuration = new Configuration(scans);
    const loggerTransport = new MockLoggerTransport();

    const result: boolean = preScan(configuration, new Log([loggerTransport]));

    assertFalse(result);
    assertEquals(loggerTransport.logMessages.length, 3);
    assertEquals(loggerTransport.errorMessages.length, 2);
    assertContainsMatch(
      loggerTransport.errorMessages,
      /The pattern "a" does not have a "platform" group/,
    );
  });

  it("should fails with unknown platform", () => {
    const pattern = new ConfigurationScanWithPattern(
      new Directory(new Path("./test/resources/video-game-unknown-platform")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/^(.+) \((\d{4})\)\/(.+)\/.+\.webp$/, [
        "title",
        "year",
        "platform",
      ]),
    );
    const scans: ConfigurationScanWithPattern[] = [pattern];
    const configuration: Configuration = new Configuration(scans);
    const loggerTransport = new MockLoggerTransport();

    const result: boolean = preScan(configuration, new Log([loggerTransport]));

    assertFalse(result);
    assertEquals(loggerTransport.logMessages.length, 3);
    assertEquals(loggerTransport.errorMessages.length, 2);
    assertContainsMatch(
      loggerTransport.errorMessages,
      /has an invalid platform: Atari/,
    );
  });

  it("should fails with big file", () => {
    const pattern = new ConfigurationScanWithPattern(
      new Directory(new Path("./test/resources/video-game-big-size")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/^(.+) \((\d{4})\)\/(.+)\/.+\.webp$/, [
        "title",
        "year",
        "platform",
      ]),
    );
    const scans: ConfigurationScanWithPattern[] = [pattern];
    const configuration: Configuration = new Configuration(scans);
    const loggerTransport = new MockLoggerTransport();

    const result: boolean = preScan(configuration, new Log([loggerTransport]));

    assertFalse(result);
    assertEquals(loggerTransport.logMessages.length, 3);
    assertEquals(loggerTransport.errorMessages.length, 2);
    assertContainsMatch(
      loggerTransport.errorMessages,
      /is too big: 1283244 bytes \(max: 999997.44 bytes\)/,
    );
  });
});
