import { assertEquals } from "jsr:@std/assert";
import { File } from "../../../../src/filesystem/domain/valueobject/File.ts";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "../../../../src/filesystem/repository/FilesRepository.ts";
import { Scan } from "../../../../src/filesystem/service/Scan.ts";
import { MockFilesDataAccessor } from "../../../mock/repository/MockFilesDataAccessor.ts";

Deno.test(async function saveFiles() {
  const files = [new File(new Path("LICENSE"))];
  const accessor = new MockFilesDataAccessor();
  const service = new Scan(new FilesRepository(accessor));
  await service.saveFiles(files);
  assertEquals(accessor.files, files);
});
