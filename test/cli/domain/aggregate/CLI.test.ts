import { assert, assertEquals, assertThrows } from "@std/assert";
import { CLI } from "../../../../src/cli/domain/aggregate/CLI.ts";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

Deno.test(function buildNoConfiguration() {
  const error = assertThrows(() => CLI.builder().build());
  assert(error instanceof Error);
  assertEquals(error.message, "Configuration is required");
});

Deno.test(function buildNoAction() {
  const error = assertThrows(() =>
    CLI.builder()
      .withConfiguration(new File(new Path("README.md")))
      .build(),
  );
  assert(error instanceof Error);
  assertEquals(
    error.message,
    "Action is required: prescanner, publisher or scanner",
  );
});
