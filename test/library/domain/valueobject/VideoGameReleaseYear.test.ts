import {
  assert,
  assertFalse,
  assertEquals,
  assertThrows,
} from "jsr:@std/assert";
import { VideoGameReleaseYear } from "../../../../src/library/domain/valueobject/VideoGameReleaseYear.ts";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";

Deno.test(function notEquals() {
  const obj = new VideoGameReleaseYear(2000);
  assertFalse(obj.equals("foo"));
});

Deno.test(function wrongYear() {
  const error = assertThrows(() => new VideoGameReleaseYear(0)) as Error;

  assert(error instanceof DomainError);
  assertEquals(error.message, "Year 0 must be greater than or equal to 1900");
});
