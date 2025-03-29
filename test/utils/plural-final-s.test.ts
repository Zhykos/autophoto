import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { pluralFinalS } from "../../src/utils/plural-final-s.ts";

describe("pluralFinalS", () => {
  it("with small number", () => {
    const phrase = pluralFinalS(1, "word", true);

    assertEquals(phrase, "1 word");
  });

  it("with huge number", () => {
    const phrase = pluralFinalS(1000, "word", true);

    assertEquals(phrase, "1,000 words");
  });
});
