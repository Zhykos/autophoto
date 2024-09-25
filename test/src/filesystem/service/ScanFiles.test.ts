import {
  assertArrayIncludes,
  assertEquals,
  assertMatch,
} from "jsr:@std/assert";
import { Directory } from "../../../../src/filesystem/domain/valueobject/Directory.ts";
import type { File } from "../../../../src/filesystem/domain/valueobject/File.ts";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "../../../../src/filesystem/repository/FilesRepository.ts";
import { ScanFiles } from "../../../../src/filesystem/service/ScanFiles.ts";
import { MockFilesDataAccessor } from "../../../mock/repository/MockFilesDataAccessor.ts";

Deno.test(async function scanEmptyDirectory() {
  const service = new ScanFiles(
    new FilesRepository(new MockFilesDataAccessor()),
  );
  const files: Map<Directory, File[]> = await service.scan([]);
  assertEquals(files.size, 0);
});

Deno.test(async function scanDirectoryRecursively() {
  // GIVEN
  const service = new ScanFiles(
    new FilesRepository(new MockFilesDataAccessor()),
  );
  const directory = new Directory(new Path("./test/resources"));

  // WHEN
  const files: Map<Directory, File[]> = await service.scan([directory]);

  // THEN
  assertEquals(files.size, 1);
  assertEquals(files.get(directory)?.length, 5);

  const filesPaths: string[] = (files.get(directory) as File[]).map(
    (file) => file.path.value,
  );
  assertArrayIncludes(filesPaths, [
    "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
  ]);
  assertArrayIncludes(filesPaths, [
    "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00002.webp",
  ]);
  assertArrayIncludes(filesPaths, [
    "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00001.webp",
  ]);
  assertArrayIncludes(filesPaths, [
    "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00005.webp",
  ]);
  assertArrayIncludes(filesPaths, [
    "./test/resources/video-game/80's Overdrive (2017)/Nintendo Switch/80's Overdrive - 00006.webp",
  ]);

  const filesChecksums: Promise<string>[] = (
    files.get(directory) as File[]
  ).map((file) => file.getChecksum());
  Promise.all(filesChecksums).then((checksums) => {
    for (const checksum of checksums) {
      assertMatch(checksum, /^[0-9a-f]{128}$/);
    }
  });
});
