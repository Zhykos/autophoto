import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGameReleaseYear } from "../../../../src/scanner/domain/valueobject/VideoGameReleaseYear.ts";

describe("VideoGameReleaseYear", () => {
  it("should throw an error for year 0", () => {
    const error = assertThrows(() => new VideoGameReleaseYear(0));

    assert(error instanceof DomainError);
    assertEquals(error.message, "Year 0 must be greater than or equal to 1900");
  });

  it("should not be equal to a non-VideoGameReleaseYear object", () => {
    assertFalse(new VideoGameReleaseYear(9000).equals("foo"));
  });
});
