import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
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

Deno.test(function equals() {
  const obj1 = new Credentials("login", "password");
  const obj2 = new Credentials("login", "password");
  assert(obj1.equals(obj2));
});

Deno.test(function notEquals() {
  const obj1 = new Credentials("login", "password");
  const obj2 = "string";
  assertFalse(obj1.equals(obj2));
});
