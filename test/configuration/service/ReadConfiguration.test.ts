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
  assertEquals(configuration.scans[0].fileType, "video-game");
  assertEquals(
    configuration.scans[0].pattern.regex.source,
    "^(.+) \\(\\d{4}\\)\\/(.+)\\/.+\\.webp$",
  );
  assertEquals(configuration.scans[0].pattern.groups, [
    "name",
    "year",
    "platform",
  ]);
});

Deno.test(function loadFileDoesNotExist() {
  assertThrows(() => new ReadConfiguration().load("./foo.yml"));
});

Deno.test(function invalidYaml() {
  assertThrows(() =>
    new ReadConfiguration().load("./test/resources/invalid-config.yml"),
  );
});
