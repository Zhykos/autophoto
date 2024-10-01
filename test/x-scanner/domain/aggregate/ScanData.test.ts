import { assertEquals } from "jsr:@std/assert";
import { ScanData } from "../../../../src/x-scanner/domain/aggregate/ScanData.ts";
import { File } from "../../../../src/x-scanner/domain/valueobject/File.ts";
import { Path } from "../../../../src/x-scanner/domain/valueobject/Path.ts";

Deno.test(function buildWithConfigurationFilePath() {
  const data = ScanData.builder()
    .withConfigurationFilePath(new File(new Path("config.yml")))
    .build();
  assertEquals(data.configurationFilePath.path.value, "config.yml");
});
