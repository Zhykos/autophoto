import {
  assert,
  assertEquals,
  assertFalse,
  assertThrows,
} from "jsr:@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGameTitle } from "../../../../src/library/domain/valueobject/VideoGameTitle.ts";

Deno.test(function notEquals() {
  const obj = new VideoGameTitle("foo");
  assertFalse(obj.equals("foo"));
});

Deno.test(function wrongYear() {
  const error = assertThrows(() => new VideoGameTitle("")) as Error;

  assert(error instanceof DomainError);
  assertEquals(error.message, "Title must have at least 1 character");
});
