import { assert, assertFalse, assertThrows } from "jsr:@std/assert";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

Deno.test(function pathEmpty() {
  assertThrows(() => new Path(""));
});

Deno.test(function endingSlash() {
  assertThrows(() => new Path("foo/"));
});

Deno.test(function fileNotExists() {
  assertThrows(() => new Path("foo"));
});

Deno.test(function notEquals() {
  const path = new Path("LICENSE");
  assertFalse(path.equals("dir2"));
});

Deno.test(function equals() {
  const path1 = new Path("LICENSE");
  const path2 = new Path("LICENSE");
  assert(path1.equals(path2));
});
