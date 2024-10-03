import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGameTitle } from "../../../../src/scanner/domain/valueobject/VideoGameTitle.ts";

Deno.test(function wrongYear() {
  const error = assertThrows(() => new VideoGameTitle(""));

  assert(error instanceof DomainError);
  assertEquals(error.message, "Title must have at least 1 character");
});

Deno.test(function notEquals() {
  assertFalse(new VideoGameTitle("foo").equals("foo"));
});
