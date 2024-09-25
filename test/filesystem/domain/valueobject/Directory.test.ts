import { Directory } from "../../../../src/filesystem/domain/valueobject/Directory.ts";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";
import { assert, assertFalse } from "jsr:@std/assert";

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
