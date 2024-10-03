import { assert, assertEquals, assertThrows } from "@std/assert";
import type { CLI } from "../../../src/cli/domain/aggregate/CLI.ts";
import { CLIService } from "../../../src/cli/service/CLIService.ts";

Deno.test(function noArgs() {
  const error = assertThrows(() => new CLIService().read([]));
  assert(error instanceof Error);
  assertEquals(error.message, 'Command line must have only one argument: ""');
});

Deno.test(function tooMuchArgs() {
  const error = assertThrows(() =>
    new CLIService().read(["README.md", "LICENSE"]),
  );
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Command line must have only one argument: "README.md,LICENSE"',
  );
});

Deno.test(function argMustBeExistingPath() {
  const error = assertThrows(() => new CLIService().read(["foo"]));
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Command line argument must be an existing path: "foo"',
  );
});

Deno.test(function argMustBeFile() {
  const error = assertThrows(() => new CLIService().read(["src"]));
  assert(error instanceof Error);
  assertEquals(error.message, 'Path is not a file: "src"');
});

Deno.test(function readOK() {
  const cliResult: CLI = new CLIService().read(["README.md"]);
  assertEquals(cliResult.configuration.path.value, "README.md");
});

Deno.test(function cronOK() {
  const cliResult: CLI = new CLIService().read([
    "--cron=*/1 * * * *",
    "README.md",
  ]);
  assertEquals(cliResult.configuration.path.value, "README.md");
});

Deno.test(function wrongCron() {
  const error = assertThrows(() =>
    new CLIService().read(["--cron=*/1 *", "README.md"]),
  );
  assert(error instanceof Error);
  assertEquals(error.message, 'Invalid cron expression: "*/1 *"');
});

Deno.test(function newDatabaseFile() {
  const cliResult: CLI = new CLIService().read([
    "--database=new.db",
    "README.md",
  ]);
  assertEquals(cliResult.configuration.path.value, "README.md");
  assertEquals(cliResult.databaseFilepath, "new.db");
});
