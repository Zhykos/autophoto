import { assert, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { ConfigurationDataPattern } from "../../../../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";

describe("ConfigurationDataPattern", () => {
  it("should be equal when regex and groups are the same", () => {
    const obj1 = new ConfigurationDataPattern(/a/, ["b"]);
    const obj2 = new ConfigurationDataPattern(/a/, ["b"]);
    assert(obj1.equals(obj2));
  });

  it("should not be equal when regex is different", () => {
    const obj1 = new ConfigurationDataPattern(/b/, ["b"]);
    const obj2 = new ConfigurationDataPattern(/a/, ["b"]);
    assertFalse(obj1.equals(obj2));
  });

  it("should not be equal when groups are different", () => {
    const obj1 = new ConfigurationDataPattern(/a/, ["a"]);
    const obj2 = new ConfigurationDataPattern(/a/, ["b"]);
    assertFalse(obj1.equals(obj2));
  });

  it("should not be equal when compared with a different type", () => {
    const obj = new ConfigurationDataPattern(/a/, ["a"]);
    assertFalse(obj.equals("dir2"));
  });
});
