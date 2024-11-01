import { assert, assertFalse } from "@std/assert";
import { assertEquals } from "@std/assert/equals";
import { assertRejects } from "@std/assert/rejects";
import { describe, it } from "@std/testing/bdd";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { BlueskyImage } from "../../../../src/publisher/domain/valueobject/BlueskyImage.ts";
import { createFakeBlobRef } from "../../../test-utils/createFakeBlobRef.ts";

describe("BlueskyImage", () => {
  it("should be equal when properties are the same", async () => {
    const obj1 = new BlueskyImage(
      new File(new Path("README.md")),
      "alt",
      await createFakeBlobRef(),
    );
    const obj2 = new BlueskyImage(
      new File(new Path("README.md")),
      "alt",
      await createFakeBlobRef(),
    );
    assert(obj1.equals(obj2));
  });

  it("should not be equal when compared with a string", async () => {
    const obj1 = new BlueskyImage(
      new File(new Path("README.md")),
      "alt",
      await createFakeBlobRef(),
    );
    const obj2 = "string";
    assertFalse(obj1.equals(obj2));
  });

  it("should throw an error when alt is empty", async () => {
    const error = await assertRejects(async () => {
      new BlueskyImage(
        new File(new Path("README.md")),
        "",
        await createFakeBlobRef(),
      );
    });
    assert(error instanceof Error);
    assertEquals(error.message, "Alt is empty!");
  });
});
