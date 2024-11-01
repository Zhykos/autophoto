import { assert, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { PreScannerAction } from "../../../../src/cli/domain/valueobject/PreScannerAction.ts";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

describe("PreScanner Action", () => {
  it("should be equal", () => {
    const obj1 = new PreScannerAction(new File(new Path("README.md")));
    const obj2 = new PreScannerAction(new File(new Path("README.md")));
    assert(obj1.equals(obj2));
  });

  it("should not be equal", () => {
    const obj1 = new PreScannerAction(new File(new Path("README.md")));
    const obj2 = "string";
    assertFalse(obj1.equals(obj2));
  });
});
