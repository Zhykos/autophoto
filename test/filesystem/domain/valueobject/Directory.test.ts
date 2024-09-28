import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertMatch,
  assertThrows,
} from "jsr:@std/assert";
import { Directory } from "../../../../src/filesystem/domain/valueobject/Directory.ts";
import type { File } from "../../../../src/filesystem/domain/valueobject/File.ts";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";

Deno.test(function equals() {
  const dir1 = new Directory(new Path("src"));
  const dir2 = new Directory(new Path("src"));
  assert(dir1.equals(dir2));
});

Deno.test(function notEqualsSameType() {
  const dir1 = new Directory(new Path("src"));
  const dir2 = new Directory(new Path("test"));
  assertFalse(dir1.equals(dir2));
});

Deno.test(function notEquals() {
  const dir = new Directory(new Path("src"));
  assertFalse(dir.equals("dir2"));
});

Deno.test(function notDirectory() {
  assertThrows(() => new Directory(new Path("LICENSE")));
});

Deno.test(async function scanDirectoryRecursively() {
  // GIVEN
  const directory = new Directory(new Path("./test/resources/video-game"));

  // WHEN
  const files: File[] = await directory.scanDirectories(/^.+webp$/);

  // THEN
  assertEquals(files.length, 5);

  const filesPaths: string[] = files.map((file) => file.path.value);

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

  const filesChecksums: Promise<string>[] = files.map((file) =>
    file.getChecksum(),
  );

  Promise.all(filesChecksums).then((checksums) => {
    for (const checksum of checksums) {
      assertMatch(checksum, /^[0-9a-f]{128}$/);
    }
  });
});
