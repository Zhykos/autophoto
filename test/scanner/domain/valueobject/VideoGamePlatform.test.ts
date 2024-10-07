import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGamePlatform } from "../../../../src/scanner/domain/valueobject/VideoGamePlatform.ts";

Deno.test(function wrongPlatform() {
  const error = assertThrows(() => new VideoGamePlatform("foo"));

  assert(error instanceof DomainError);
  assertEquals(
    error.message,
    "Platform (foo) must be one of the following: Nintendo Switch, PC",
  );
});

Deno.test(function equals() {
  assert(new VideoGamePlatform("PC").equals(new VideoGamePlatform("PC")));
});

Deno.test(function notEquals() {
  assertFalse(new VideoGamePlatform("PC").equals("foo"));
});
