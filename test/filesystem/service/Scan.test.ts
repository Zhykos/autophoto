import { assertEquals } from "jsr:@std/assert";
import { Directory } from "../../../src/filesystem/domain/valueobject/Directory.ts";
import { FileType } from "../../../src/filesystem/domain/valueobject/FileType.ts";
import { Path } from "../../../src/filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "../../../src/filesystem/repository/FilesRepository.ts";
import { Scan } from "../../../src/filesystem/service/Scan.ts";
import { MockFilesDataAccessor } from "../../mock/repository/MockFilesDataAccessor.ts";

Deno.test(async function scanAndSave() {
  const directory = new Directory(new Path("./test/resources/video-game"));
  const accessor = new MockFilesDataAccessor();
  const service = new Scan(new FilesRepository(accessor));
  await service.scanAndSave(directory, FileType.VIDEO_GAME);
  assertEquals(accessor.files.length, 5);
});
