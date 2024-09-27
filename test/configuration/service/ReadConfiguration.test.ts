import { assertEquals, assertThrows } from "jsr:@std/assert";
import type { Configuration } from "../../../src/configuration/domain/aggregate/Configuration.ts";
import { ReadConfiguration } from "../../../src/configuration/service/ReadConfiguration.ts";

Deno.test(function load() {
  const configuration: Configuration = new ReadConfiguration().load(
    "./config.yml",
  );

  assertEquals(configuration.scans.length, 1);
  assertEquals(
    configuration.scans[0].directory.rootDir.value,
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

Deno.test(function loadFileDoesNotExist() {
  const error = assertThrows(() =>
    new ReadConfiguration().load("./foo.yml"),
  ) as Error;

  assertEquals(error.message, 'Configuration file not found: "./foo.yml"');
});

Deno.test(function invalidYaml() {
  const error = assertThrows(() =>
    new ReadConfiguration().load("./test/resources/invalid-config.yml"),
  ) as Error;

  assertEquals(
    error.message,
    'Invalid configuration file: "./test/resources/invalid-config.yml"',
  );
});

Deno.test(function invalidYamlNoDirectory() {
  const error = assertThrows(() =>
    new ReadConfiguration().load(
      "./test/resources/invalid-config-no-directory.yml",
    ),
  ) as Error;

  assertEquals(
    error.message,
    'Invalid configuration scan: {"type":"video-game","data-pattern":{"regex":"^(.+) \\\\(\\\\d{4}\\\\)/(.+)/.+\\\\.webp$","groups":["title"]}}',
  );
});

Deno.test(function invalidYamlType() {
  const error = assertThrows(() =>
    new ReadConfiguration().load("./test/resources/invalid-config-type.yml"),
  ) as Error;

  assertEquals(error.message, 'Invalid directory type: "foo"');
});
