import { assert, assertEquals, assertThrows } from "@std/assert";
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
