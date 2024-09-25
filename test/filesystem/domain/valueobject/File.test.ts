import { File } from "../../../../src/filesystem/domain/valueobject/File.ts";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";
import { assert, assertFalse } from "jsr:@std/assert";

Deno.test(function equals() {
  const dir1 = new File(new Path("LICENSE"));
  const dir2 = new File(new Path("LICENSE"));
  assert(dir1.equals(dir2));
});

Deno.test(function notEqualsSameType() {
  const dir1 = new File(new Path("LICENSE"));
  const dir2 = new File(new Path("README.md"));
  assertFalse(dir1.equals(dir2));
});

Deno.test(function notEquals() {
  const dir = new File(new Path("LICENSE"));
  assertFalse(dir.equals("dir2"));
});
