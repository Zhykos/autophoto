import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGamePlatform } from "../../../../src/scanner/domain/valueobject/VideoGamePlatform.ts";

describe("VideoGamePlatform", () => {
  it("should throw an error for wrong platform", () => {
    const error = assertThrows(() => new VideoGamePlatform("foo"));

    assert(error instanceof DomainError);
    assertEquals(
      error.message,
      "Platform (foo) must be one of the following: Android, Android (preview), Nintendo Switch, PC, PC (alpha), PC (demo), PC (early access), PS Vita, PlayStation 4, PlayStation 4 (beta), PlayStation 4 (demo), PlayStation 5, Steam Deck, Xbox 360, Xbox Game Cloud, Xbox One, Xbox Series X, Xbox Series X (beta), iOS, unknown",
    );
  });

  it("should return true for equal platforms", () => {
    assert(new VideoGamePlatform("PC").equals(new VideoGamePlatform("PC")));
  });

  it("should return false for non-equal platforms", () => {
    assertFalse(new VideoGamePlatform("PC").equals("foo"));
  });
});
