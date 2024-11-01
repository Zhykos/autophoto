import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import type { CLI } from "../../../src/cli/domain/aggregate/CLI.ts";
import { BlueskyPublisherAction } from "../../../src/cli/domain/valueobject/BlueskyPublisherAction.ts";
import { ScannerAction } from "../../../src/cli/domain/valueobject/ScannerAction.ts";
import { CLIService } from "../../../src/cli/service/CLIService.ts";

Deno.test(function noArgs() {
  const error = assertThrows(() => new CLIService().read([]));
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Only one option allowed: "--prescan" or "--publish" or "--scan"',
  );
});

Deno.test(function tooMuchArgs() {
  const error = assertThrows(() =>
    new CLIService().read(["README.md", "LICENSE"]),
  );
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Command line argument is not allowed: "README.md,LICENSE"',
  );
});

Deno.test(function argMustBeExistingPath() {
  const error = assertThrows(() => new CLIService().read(["foo"]));
  assert(error instanceof Error);
  assertEquals(error.message, 'Command line argument is not allowed: "foo"');
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
    'Command line argument is not allowed: "README.md"',
  );
});

Deno.test(function readScanOK() {
  const cliResult: CLI = new CLIService().read(["--scan=README.md"]);
  assert(cliResult.action instanceof ScannerAction);
  assertEquals(
    (cliResult.action as ScannerAction).configurationFile.path.value,
    "README.md",
  );
  assertFalse(cliResult.action.debug);
});

Deno.test(function readPublishOK() {
  const cliResult: CLI = new CLIService().read([
    "--publish",
    "--bluesky_login=login",
    "--bluesky_password=password",
  ]);
  assert(cliResult.action instanceof BlueskyPublisherAction);
});

Deno.test(function newDatabaseFile() {
  const cliResult: CLI = new CLIService().read([
    "--database=new.db",
    "--scan=README.md",
  ]);
  assertEquals(
    (cliResult.action as ScannerAction).configurationFile.path.value,
    "README.md",
  );
  assertEquals(cliResult.action.databaseFilepath, "new.db");
});

Deno.test(function debug() {
  const cliResult: CLI = new CLIService().read(["--debug", "--scan=README.md"]);
  assert(cliResult.action.debug);
});
