import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { BlueskyPublisherAction } from "../../../../src/cli/domain/valueobject/BlueskyPublisherAction.ts";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";

describe("BlueskyPublisherAction", () => {
  it("should be equal when properties are the same", () => {
    const obj1 = new BlueskyPublisherAction(
      new URL("http://zhykos.fr"),
      "login",
      "password",
    );
    const obj2 = new BlueskyPublisherAction(
      new URL("http://zhykos.fr"),
      "login",
      "password",
    );
    assert(obj1.equals(obj2));
  });

  it("should not be equal when compared with a string", () => {
    const obj1 = new BlueskyPublisherAction(
      new URL("http://zhykos.fr"),
      "login",
      "password",
    );
    const obj2 = "string";
    assertFalse(obj1.equals(obj2));
  });

  it("should throw an error when login is empty", () => {
    const error = assertThrows(
      () =>
        new BlueskyPublisherAction(new URL("http://zhykos.fr"), "", "password"),
    );
    assert(error instanceof DomainError);
    assertEquals(error.message, "Login is required");
  });

  it("should throw an error when password is empty", () => {
    const error = assertThrows(
      () =>
        new BlueskyPublisherAction(new URL("http://zhykos.fr"), "login", ""),
    );
    assert(error instanceof DomainError);
    assertEquals(error.message, "Password is required");
  });
});
