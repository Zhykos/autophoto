import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGameReleaseYear } from "../../../../src/scanner/domain/valueobject/VideoGameReleaseYear.ts";

Deno.test(function wrongYear() {
  const error = assertThrows(() => new VideoGameReleaseYear(0));

  assert(error instanceof DomainError);
  assertEquals(error.message, "Year 0 must be greater than or equal to 1900");
});

Deno.test(function notEquals() {
  assertFalse(new VideoGameReleaseYear(9000).equals("foo"));
});
