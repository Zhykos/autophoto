import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { Publication } from "../../../../src/publisher/domain/valueobject/Publication.ts";

describe("Publication", () => {
  it("should throw an error when no images are provided", () => {
    const error = assertThrows(() => new Publication("message", []));
    assert(error instanceof Error);
    assertEquals(error.message, "Images are empty!");
  });

  it("should throw an error when no message is provided", () => {
    const error = assertThrows(() => new Publication("", []));
    assert(error instanceof Error);
    assertEquals(error.message, "Message is empty!");
  });

  it("should return true when two publications are equal", () => {
    const obj1 = new Publication("message", [new File(new Path("README.md"))]);
    const obj2 = new Publication("message", [new File(new Path("README.md"))]);
    assert(obj1.equals(obj2));
  });

  it("should return false when comparing a publication with a non-publication object", () => {
    const obj1 = new Publication("message", [new File(new Path("README.md"))]);
    const obj2 = "string";
    assertFalse(obj1.equals(obj2));
  });

  it("should throw an error when too many images are provided", () => {
    const error = assertThrows(
      () =>
        new Publication("foo", [
          new File(new Path("README.md")),
          new File(new Path("README.md")),
          new File(new Path("README.md")),
          new File(new Path("README.md")),
          new File(new Path("README.md")),
        ]),
    );
    assert(error instanceof Error);
    assertEquals(error.message, "Too many images!");
  });

  it("should throw an error when the number of alts does not match the number of images", () => {
    const error = assertThrows(
      () =>
        new Publication(
          "foo",
          [new File(new Path("README.md"))],
          ["alt", "alt"],
        ),
    );
    assert(error instanceof Error);
    assertEquals(error.message, "Alts length does not match images length!");
  });

  it("should throw an error when an alt is empty", () => {
    const error = assertThrows(
      () => new Publication("foo", [new File(new Path("README.md"))], [""]),
    );
    assert(error instanceof Error);
    assertEquals(error.message, "An alt is empty!");
  });
});
