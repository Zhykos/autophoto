import { assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { isDirectory, isFile } from "../../../src/utils/file.ts";

describe("File Utils", () => {
  it("should return false for isFile with 'foo'", () => {
    assertFalse(isFile("foo"));
  });

  it("should return false for isDirectory with 'foo'", () => {
    assertFalse(isDirectory("foo"));
  });
});
