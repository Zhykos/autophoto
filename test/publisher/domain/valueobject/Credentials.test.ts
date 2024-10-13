import { assert, assertEquals, assertThrows } from "@std/assert";
import { Credentials } from "../../../../src/publisher/domain/valueobject/Credentials.ts";

Deno.test(function noLogin() {
  const error = assertThrows(() => new Credentials("", ""));
  assert(error instanceof Error);
  assertEquals(error.message, "Identifier is empty!");
});

Deno.test(function noPassword() {
  const error = assertThrows(() => new Credentials("login", ""));
  assert(error instanceof Error);
  assertEquals(error.message, "Password is empty!");
});
