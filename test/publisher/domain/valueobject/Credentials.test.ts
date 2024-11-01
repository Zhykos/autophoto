import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Credentials } from "../../../../src/publisher/domain/valueobject/Credentials.ts";

describe("Credentials", () => {
  it("should throw an error when no login is provided", () => {
    const error = assertThrows(() => new Credentials("", ""));
    assert(error instanceof Error);
    assertEquals(error.message, "Identifier is empty!");
  });

  it("should throw an error when no password is provided", () => {
    const error = assertThrows(() => new Credentials("login", ""));
    assert(error instanceof Error);
    assertEquals(error.message, "Password is empty!");
  });

  it("should be equal when credentials are the same", () => {
    const obj1 = new Credentials("login", "password");
    const obj2 = new Credentials("login", "password");
    assert(obj1.equals(obj2));
  });

  it("should not be equal when credentials are different", () => {
    const obj1 = new Credentials("login", "password");
    const obj2 = "string";
    assertFalse(obj1.equals(obj2));
  });
});
