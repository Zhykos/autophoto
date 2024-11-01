import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type { CLI } from "../../../src/cli/domain/aggregate/CLI.ts";
import { BlueskyPublisherAction } from "../../../src/cli/domain/valueobject/BlueskyPublisherAction.ts";
import { ScannerAction } from "../../../src/cli/domain/valueobject/ScannerAction.ts";
import { CLIService } from "../../../src/cli/service/CLIService.ts";
import { mockLogger } from "../../mock/logger/mockLogger.ts";

describe("CLIService", () => {
  it("should fail if no args", () => {
    const error = assertThrows(() => new CLIService().read([], mockLogger()));
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Only one option allowed: "--prescan" or "--publish" or "--scan"',
    );
  });

  it("should fail if too mush args", () => {
    const error = assertThrows(() =>
      new CLIService().read(["README.md", "LICENSE"], mockLogger()),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Command line argument is not allowed: "README.md,LICENSE"',
    );
  });

  it("should fail if one arg", () => {
    const error = assertThrows(() =>
      new CLIService().read(["foo"], mockLogger()),
    );
    assert(error instanceof Error);
    assertEquals(error.message, 'Command line argument is not allowed: "foo"');
  });

  it("should fail if scanner option is a directory", () => {
    const error = assertThrows(() =>
      new CLIService().read(["--scan=src"], mockLogger()),
    );
    assert(error instanceof Error);
    assertEquals(error.message, 'Path is not a file: "src"');
  });

  it("should fail if one file arg", () => {
    const error = assertThrows(() =>
      new CLIService().read(["README.md"], mockLogger()),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Command line argument is not allowed: "README.md"',
    );
  });

  it("should create scanner", () => {
    const cliResult: CLI = new CLIService().read(
      ["--scan=README.md"],
      mockLogger(),
    );
    assert(cliResult.action instanceof ScannerAction);
    assertEquals(
      (cliResult.action as ScannerAction).configurationFile.path.value,
      "README.md",
    );
    assertFalse(cliResult.action.debug);
  });

  it("should create publisher", () => {
    const cliResult: CLI = new CLIService().read(
      ["--publish", "--bluesky_login=login", "--bluesky_password=password"],
      mockLogger(),
    );
    assert(cliResult.action instanceof BlueskyPublisherAction);
  });

  it("should specify database", () => {
    const cliResult: CLI = new CLIService().read(
      ["--database=new.db", "--scan=README.md"],
      mockLogger(),
    );
    assertEquals(
      (cliResult.action as ScannerAction).configurationFile.path.value,
      "README.md",
    );
    assertEquals(cliResult.action.databaseFilepath, "new.db");
  });

  it("should activate debug", () => {
    const cliResult: CLI = new CLIService().read(
      ["--debug", "--scan=README.md"],
      mockLogger(),
    );
    assert(cliResult.action.debug);
  });

  it("should fail if debug prescan", () => {
    const error = assertThrows(() =>
      new CLIService().read(["--debug", "--prescan=config.yml"], mockLogger()),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--prescan" is not compatible with "--debug"',
    );
  });

  it("should fail if using a database with prescan", () => {
    const error = assertThrows(() =>
      new CLIService().read(
        ["--database=db.sqlite", "--prescan=config.yml"],
        mockLogger(),
      ),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--prescan" is not compatible with "--database"',
    );
  });

  it("should fail if using scanner with bluesky publisher", () => {
    const error = assertThrows(() =>
      new CLIService().read(
        ["--bluesky_host=https://bsky.social", "--prescan=config.yml"],
        mockLogger(),
      ),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--prescan" or "--scan" is not compatible with "--bluesky_host", "--bluesky_login" or "--bluesky_password"',
    );
  });
});
