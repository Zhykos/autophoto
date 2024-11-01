import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { Directory } from "../../../../src/common/domain/valueobject/Directory.ts";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { Image } from "../../../../src/scanner/domain/valueobject/Image.ts";

describe("Image", () => {
  it("should throw an error for non-WEBP files", () => {
    const error = assertThrows(
      () =>
        new Image(
          new Directory(new Path("src")),
          new File(new Path("README.md")),
        ),
    );

    assert(error instanceof DomainError);
    assertEquals(error.message, '"md" is not a valid WEBP image extension');
  });

  it("should return false when comparing Image with a non-Image object", () => {
    assertFalse(
      new Image(
        new Directory(new Path("src")),
        new File(
          new Path(
            "test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
          ),
        ),
      ).equals("foo"),
    );
  });
});
