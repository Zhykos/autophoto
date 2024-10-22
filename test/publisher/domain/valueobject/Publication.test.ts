import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { Publication } from "../../../../src/publisher/domain/valueobject/Publication.ts";

Deno.test(function noImage() {
  const error = assertThrows(() => new Publication("message", []));
  assert(error instanceof Error);
  assertEquals(error.message, "Images are empty!");
});

Deno.test(function noMessage() {
  const error = assertThrows(() => new Publication("", []));
  assert(error instanceof Error);
  assertEquals(error.message, "Message is empty!");
});

Deno.test(function equals() {
  const obj1 = new Publication("message", [new File(new Path("README.md"))]);
  const obj2 = new Publication("message", [new File(new Path("README.md"))]);
  assert(obj1.equals(obj2));
});

Deno.test(function notEquals() {
  const obj1 = new Publication("message", [new File(new Path("README.md"))]);
  const obj2 = "string";
  assertFalse(obj1.equals(obj2));
});

Deno.test(function tooMuchImages() {
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

Deno.test(function noEnoughAlts() {
  const error = assertThrows(
    () =>
      new Publication("foo", [new File(new Path("README.md"))], ["alt", "alt"]),
  );
  assert(error instanceof Error);
  assertEquals(error.message, "Alts length does not match images length!");
});

Deno.test(function emptyAlt() {
  const error = assertThrows(
    () => new Publication("foo", [new File(new Path("README.md"))], [""]),
  );
  assert(error instanceof Error);
  assertEquals(error.message, "An alt is empty!");
});
