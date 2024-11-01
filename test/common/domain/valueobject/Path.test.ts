import { assert, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

describe("Path", () => {
  it("should throw an error for empty path", () => {
    assertThrows(() => new Path(""));
  });

  it("should throw an error for path ending with a slash", () => {
    assertThrows(() => new Path("foo/"));
  });

  it("should throw an error for non-existent file path", () => {
    assertThrows(() => new Path("foo"));
  });

  it("should return false for non-equal paths", () => {
    const path = new Path("LICENSE");
    assertFalse(path.equals("dir2"));
  });

  it("should return true for equal paths", () => {
    const path1 = new Path("LICENSE");
    const path2 = new Path("LICENSE");
    assert(path1.equals(path2));
  });
});
