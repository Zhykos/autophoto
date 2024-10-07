import { assertFalse } from "@std/assert";
import { isDirectory, isFile } from "../../../src/utils/file.ts";

Deno.test(function isNotFile() {
  assertFalse(isFile("foo"));
});

Deno.test(function isNotFile() {
  assertFalse(isDirectory("foo"));
});
