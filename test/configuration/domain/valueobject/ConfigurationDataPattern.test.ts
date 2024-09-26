import { assert, assertFalse } from "jsr:@std/assert";
import { ConfigurationDataPattern } from "../../../../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";

Deno.test(function equals() {
  const obj1 = new ConfigurationDataPattern(/a/, ["b"]);
  const obj2 = new ConfigurationDataPattern(/a/, ["b"]);
  assert(obj1.equals(obj2));
});

Deno.test(function notEqualsSameTypeButDifferentRegex() {
  const obj1 = new ConfigurationDataPattern(/b/, ["b"]);
  const obj2 = new ConfigurationDataPattern(/a/, ["b"]);
  assertFalse(obj1.equals(obj2));
});

Deno.test(function notEqualsSameTypeButDifferentGroup() {
  const obj1 = new ConfigurationDataPattern(/a/, ["a"]);
  const obj2 = new ConfigurationDataPattern(/a/, ["b"]);
  assertFalse(obj1.equals(obj2));
});

Deno.test(function notEquals() {
  const obj = new ConfigurationDataPattern(/a/, ["a"]);
  assertFalse(obj.equals("dir2"));
});
