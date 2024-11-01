import { assert, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { ScannerAction } from "../../../../src/cli/domain/valueobject/ScannerAction.ts";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

describe("Scanner Action", () => {
  it("should be equal", () => {
    const obj1 = new ScannerAction(new File(new Path("README.md")));
    const obj2 = new ScannerAction(new File(new Path("README.md")));
    assert(obj1.equals(obj2));
  });

  it("should not be equal", () => {
    const obj1 = new ScannerAction(new File(new Path("README.md")));
    const obj2 = "string";
    assertFalse(obj1.equals(obj2));
  });
});
