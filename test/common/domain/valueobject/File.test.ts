import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

describe("File", () => {
  it("should be equal when paths are the same", () => {
    const dir1 = new File(new Path("LICENSE"));
    const dir2 = new File(new Path("LICENSE"));
    assert(dir1.equals(dir2));
  });

  it("should not be equal when paths are different", () => {
    const dir1 = new File(new Path("LICENSE"));
    const dir2 = new File(new Path("README.md"));
    assertFalse(dir1.equals(dir2));
  });

  it("should not be equal when compared with a non-file object", () => {
    const dir = new File(new Path("LICENSE"));
    assertFalse(dir.equals("dir2"));
  });

  it("should throw an error when path is not a file", () => {
    assertThrows(() => new File(new Path("src")));
  });

  it("should return an empty string for file without extension", () => {
    assertEquals(new File(new Path("LICENSE")).getExtension(), "");
  });
});
