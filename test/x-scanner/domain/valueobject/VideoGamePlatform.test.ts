import {
  assert,
  assertFalse,
  assertMatch,
  assertThrows,
} from "jsr:@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGamePlatform } from "../../../../src/x-scanner/domain/valueobject/VideoGamePlatform.ts";

Deno.test(function equals() {
  const obj1 = new VideoGamePlatform("PC");
  const obj2 = new VideoGamePlatform("PC");
  assert(obj1.equals(obj2));
});

Deno.test(function notEquals() {
  const obj = new VideoGamePlatform("PC");
  assertFalse(obj.equals("foo"));
});

Deno.test(function unknownPlatform() {
  const error = assertThrows(() => new VideoGamePlatform("PS360")) as Error;

  assert(error instanceof DomainError);
  assertMatch(error.message, /Platform must be one of the following/);
});
