import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import type { CLI } from "../../../src/cli/domain/aggregate/CLI.ts";
import { BlueskyPublisherAction } from "../../../src/cli/domain/valueobject/BlueskyPublisherAction.ts";
import { ScannerAction } from "../../../src/cli/domain/valueobject/ScannerAction.ts";
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
  const error = assertThrows(() => new CLIService().read(["--scan=src"]));
  assert(error instanceof Error);
  assertEquals(error.message, 'Path is not a file: "src"');
});

Deno.test(function argMissingAction() {
  const error = assertThrows(() => new CLIService().read(["README.md"]));
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Missing option: "--prescan" or "--publish" or "--scan"',
  );
});

Deno.test(function readScanOK() {
  const cliResult: CLI = new CLIService().read(["--scan=README.md"]);
  assertEquals(cliResult.configuration.path.value, "README.md");
  assert(cliResult.action instanceof ScannerAction);
  assertFalse(cliResult.debug);
});

Deno.test(function readPublishOK() {
  const cliResult: CLI = new CLIService().read([
    "--publish",
    "--bluesky_login=login",
    "--bluesky_password=password",
  ]);
  assertEquals(cliResult.configuration.path.value, "README.md");
  assert(cliResult.action instanceof BlueskyPublisherAction);
});

Deno.test(function newDatabaseFile() {
  const cliResult: CLI = new CLIService().read([
    "--database=new.db",
    "--scan=README.md",
  ]);
  assertEquals(cliResult.configuration.path.value, "README.md");
  assertEquals(cliResult.databaseFilepath, "new.db");
});

Deno.test(function debug() {
  const cliResult: CLI = new CLIService().read(["--debug", "--scan=README.md"]);
  assert(cliResult.debug);
});
