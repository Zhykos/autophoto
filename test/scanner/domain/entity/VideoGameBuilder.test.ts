import { assert, assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGame } from "../../../../src/scanner/domain/entity/VideoGame.ts";

describe("VideoGame entity", () => {
  it("should throw a DomainError when no title is provided", () => {
    const error = assertThrows(() =>
      VideoGame.builder().withReleaseYear(9000).build(),
    );
    assert(error instanceof DomainError);
    assertEquals(
      error.message,
      "Title (undefined) and release year (9000) are required",
    );
  });
});
