import { assert, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Directory } from "../../../../src/common/domain/valueobject/Directory.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

describe("Directory", () => {
  it("should be equal when paths are the same", () => {
    const dir1 = new Directory(new Path("src"));
    const dir2 = new Directory(new Path("src"));
    assert(dir1.equals(dir2));
  });

  it("should not be equal when paths are different", () => {
    const dir1 = new Directory(new Path("src"));
    const dir2 = new Directory(new Path("test"));
    assertFalse(dir1.equals(dir2));
  });

  it("should not be equal when compared to a non-directory object", () => {
    const dir = new Directory(new Path("src"));
    assertFalse(dir.equals("dir2"));
  });

  it("should throw an error when initialized with an invalid path", () => {
    assertThrows(() => new Directory(new Path("LICENSE")));
  });
});
