import { assert, assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { CLI } from "../../../../src/cli/domain/aggregate/CLI.ts";

describe("CLI", () => {
  it("should fail if no configuration", () => {
    const error = assertThrows(() => CLI.builder().build());
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });

  it("should fail if no action", () => {
    const error = assertThrows(() => CLI.builder().build());
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });

  it("should fail if no action but database", () => {
    const error = assertThrows(() =>
      CLI.builder().withDatabaseFilepath("").build(),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });

  it("should fail if no action but debug", () => {
    const error = assertThrows(() => CLI.builder().withDebug().build());
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });
});
