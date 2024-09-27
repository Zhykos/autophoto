import { assertEquals } from "jsr:@std/assert";
import { ScanData } from "../../../../src/x-scanner/domain/aggregate/ScanData.ts";

Deno.test(function buildWithConfigurationFilePath() {
  const data = ScanData.builder()
    .withConfigurationFilePath("config.yml")
    .build();
  assertEquals(data.configurationFilePath.path.value, "config.yml");
});
