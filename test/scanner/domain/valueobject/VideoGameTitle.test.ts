import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGameTitle } from "../../../../src/scanner/domain/valueobject/VideoGameTitle.ts";

describe("VideoGameTitle", () => {
  it("should throw an error for empty title", () => {
    const error = assertThrows(() => new VideoGameTitle(""));

    assert(error instanceof DomainError);
    assertEquals(error.message, "Title must have at least 1 character");
  });

  it("should not equal a string", () => {
    assertFalse(new VideoGameTitle("foo").equals("foo"));
  });
});
