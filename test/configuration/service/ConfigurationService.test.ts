import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type { Configuration } from "../../../src/configuration/domain/aggregate/Configuration.ts";
import { ConfigurationService } from "../../../src/configuration/service/ConfigurationService.ts";

describe("ConfigurationService", () => {
  it("should load configuration from file", () => {
    const configuration: Configuration = new ConfigurationService().loadFile(
      "./config.yml",
    );

    assertEquals(configuration.scans.length, 1);
    assertEquals(
      configuration.scans[0].directory.path.value,
      "./test/resources/video-game",
    );
    assertEquals(configuration.scans[0].directoryType, "video-game");
    assertEquals(
      configuration.scans[0].pattern.regex.source,
      "^(.+) \\((\\d{4})\\)\\/(.+)\\/.+\\.webp$",
    );
    assertEquals(configuration.scans[0].pattern.groups, [
      "title",
      "release-year",
      "platform",
    ]);
  });

  it("should throw error if configuration file does not exist", () => {
    const error = assertThrows(() =>
      new ConfigurationService().loadFile("./foo.yml"),
    ) as Error;

    assertEquals(error.message, 'Configuration file not found: "./foo.yml"');
  });

  it("should throw error if configuration file is invalid YAML", () => {
    const error = assertThrows(() =>
      new ConfigurationService().loadFile(
        "./test/resources/invalid-config.yml",
      ),
    ) as Error;

    assertEquals(
      error.message,
      'Invalid configuration file: "./test/resources/invalid-config.yml"',
    );
  });

  it("should throw error if configuration YAML has no directory", () => {
    const error = assertThrows(() =>
      new ConfigurationService().loadFile(
        "./test/resources/invalid-config-no-directory.yml",
      ),
    ) as Error;

    assertEquals(
      error.message,
      'Invalid configuration scan: {"type":"video-game","data-pattern":{"regex":"^(.+) \\\\(\\\\d{4}\\\\)/(.+)/.+\\\\.webp$","groups":["title"]}}',
    );
  });

  it("should throw error if configuration YAML has invalid directory type", () => {
    const error = assertThrows(() =>
      new ConfigurationService().loadFile(
        "./test/resources/invalid-config-type.yml",
      ),
    ) as Error;

    assertEquals(error.message, 'Invalid directory type: "foo"');
  });
});
