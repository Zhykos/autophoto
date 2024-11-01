import { assert, assertEquals, assertThrows } from "@std/assert";
import { CLI } from "../../../../src/cli/domain/aggregate/CLI.ts";

Deno.test(function buildNoConfiguration() {
  const error = assertThrows(() => CLI.builder().build());
  assert(error instanceof Error);
  assertEquals(
    error.message,
    "Action is required: prescanner, publisher or scanner",
  );
});

Deno.test(function buildNoAction() {
  const error = assertThrows(() => CLI.builder().build());
  assert(error instanceof Error);
  assertEquals(
    error.message,
    "Action is required: prescanner, publisher or scanner",
  );
});
