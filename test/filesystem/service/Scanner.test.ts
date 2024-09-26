import { assertEquals } from "jsr:@std/assert";
import { ScanData } from "../../../src/filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "../../../src/filesystem/domain/valueobject/Directory.ts";
import { Path } from "../../../src/filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "../../../src/filesystem/repository/FilesRepository.ts";
import { Scanner } from "../../../src/filesystem/service/Scanner.ts";
import { MockFilesDataAccessor } from "../../mock/repository/MockFilesDataAccessor.ts";

Deno.test(async function scanAndSave() {
  const directory = new Directory(new Path("./test/resources/video-game"));
  const accessor = new MockFilesDataAccessor();
  const service = new Scanner(new FilesRepository(accessor));
  const scanData = new ScanData(directory, /^.+webp$/);
  await service.scanAndSave(scanData);
  assertEquals(accessor.files.length, 5);
});
