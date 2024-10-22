import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

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

Deno.test(function notFile() {
  assertThrows(() => new File(new Path("src")));
});

Deno.test(function fileWithoutExtension() {
  assertEquals(new File(new Path("LICENSE")).getExtension(), "");
});
