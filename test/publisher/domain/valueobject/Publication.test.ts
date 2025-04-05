import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { Publication } from "../../../../src/publisher/domain/valueobject/Publication.ts";

describe("Publication", () => {
  it("should not throw an error when 0 images are provided", () => {
    const publication = new Publication("message", []);
    assertEquals(publication.message, "message");
    assertEquals(publication.images, []);
  });

  it("should not throw an error when no images are provided", () => {
    const publication = new Publication("message");
    assertEquals(publication.message, "message");
    assertEquals(publication.images, undefined);
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
    assertEquals(error.message, "There is an alt message which is empty!");
  });

  it("should return false when comparing publications with an image and a byte array", () => {
    const obj1 = new Publication("message", [new File(new Path("README.md"))]);
    const obj2 = new Publication("message", [new Uint8Array()]);
    assertFalse(obj1.equals(obj2));
  });

  it("should return true when comparing publications with the same byte array", () => {
    const byteArray = new Uint8Array();
    const obj1 = new Publication("message", [byteArray]);
    const obj2 = new Publication("message", [byteArray]);
    assert(obj1.equals(obj2));
  });
});
