import { assert, assertEquals, assertThrows } from "jsr:@std/assert";
import { CLI } from "../../../src/cli/service/CLI.ts";
import type { File } from "../../../src/common/domain/valueobject/File.ts";

Deno.test(function noArgs() {
  const error = assertThrows(() => new CLI().read([]));
  assert(error instanceof Error);
  assertEquals(error.message, 'Command line must have only one argument: ""');
});

Deno.test(function tooMuchArgs() {
  const error = assertThrows(() => new CLI().read(["README.md", "LICENSE"]));
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Command line must have only one argument: "README.md,LICENSE"',
  );
});

Deno.test(function argMustBeExistingPath() {
  const error = assertThrows(() => new CLI().read(["foo"]));
  assert(error instanceof Error);
  assertEquals(
    error.message,
    'Command line argument must be an existing path: "foo"',
  );
});

Deno.test(function argMustBeFile() {
  const error = assertThrows(() => new CLI().read(["src"]));
  assert(error instanceof Error);
  assertEquals(error.message, 'Path is not a file: "src"');
});

Deno.test(function readOK() {
  const cliResult: File = new CLI().read(["README.md"]);
  assertEquals(cliResult.path.value, "README.md");
});
