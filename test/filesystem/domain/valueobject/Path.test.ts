import { assertThrows, assertFalse } from "jsr:@std/assert";
import { Path } from "../../../../src/filesystem/domain/valueobject/Path.ts";

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
