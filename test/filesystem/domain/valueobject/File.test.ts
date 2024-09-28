import { assert, assertFalse, assertThrows } from "jsr:@std/assert";
import { File } from "../../../../src/filesystem/domain/valueobject/File.ts";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";

Deno.test(async function equals() {
  const dir1 = new File(new Path("LICENSE"));
  await dir1.computeChecksum();

  const dir2 = new File(new Path("LICENSE"));
  await dir2.computeChecksum();

  assert(dir1.equals(dir2));
});

Deno.test(async function notEqualsSameType() {
  const dir1 = new File(new Path("LICENSE"));
  await dir1.computeChecksum();

  const dir2 = new File(new Path("README.md"));
  await dir2.computeChecksum();

  assertFalse(dir1.equals(dir2));
});

Deno.test(function notEquals() {
  const dir = new File(new Path("LICENSE"));
  assertFalse(dir.equals("dir2"));
});

Deno.test(function notFile() {
  assertThrows(() => new File(new Path("src")));
});
