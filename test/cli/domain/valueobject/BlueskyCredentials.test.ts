import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { BlueskyCredentials } from "../../../../src/cli/domain/valueobject/BlueskyCredentials.ts";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";

Deno.test(function equals() {
  const obj1 = new BlueskyCredentials("login", "password");
  const obj2 = new BlueskyCredentials("login", "password");
  assert(obj1.equals(obj2));
});

Deno.test(function notEquals() {
  const obj1 = new BlueskyCredentials("login", "password");
  const obj2 = "string";
  assertFalse(obj1.equals(obj2));
});

Deno.test(function noLogin() {
  const error = assertThrows(() => new BlueskyCredentials("", "password"));
  assert(error instanceof DomainError);
  assertEquals(error.message, "Login is required");
});

Deno.test(function noPassword() {
  const error = assertThrows(() => new BlueskyCredentials("login", ""));
  assert(error instanceof DomainError);
  assertEquals(error.message, "Password is required");
});
