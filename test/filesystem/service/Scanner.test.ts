import { assertEquals } from "jsr:@std/assert";
import { ScanData } from "../../../src/filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "../../../src/filesystem/domain/valueobject/Directory.ts";
import { Path } from "../../../src/filesystem/domain/valueobject/Path.ts";
import { Scanner } from "../../../src/filesystem/service/Scanner.ts";
import { MockFilesRepository } from "../../mock/repository/MockFilesRepository.ts";

Deno.test(async function scanAndSave() {
  const directory = new Directory(new Path("./test/resources/video-game"));
  const repository = new MockFilesRepository();
  const service = new Scanner(repository);
  const scanData = new ScanData(directory, /^.+webp$/);
  await service.scanAndSave(scanData);
  assertEquals(repository.files.length, 5);
});
