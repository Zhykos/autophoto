import { ConsoleLogger } from "@cross/log";
import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  BatchLogger,
  type CLI,
} from "../../../src/cli/domain/aggregate/CLI.ts";
import { BlueskyPublisherAction } from "../../../src/cli/domain/valueobject/BlueskyPublisherAction.ts";
import { ScannerAction } from "../../../src/cli/domain/valueobject/ScannerAction.ts";
import { CLIService } from "../../../src/cli/service/CLIService.ts";

describe("CLIService", () => {
  it("should fail if no args", () => {
    const error = assertThrows(() => new CLIService().read([]));
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Only one option allowed: "--prescan" or "--publish" or "--scan"',
    );
  });

  it("should fail if too mush args", () => {
    const error = assertThrows(() =>
      new CLIService().read(["README.md", "LICENSE"]),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Command line argument is not allowed: "README.md,LICENSE"',
    );
  });

  it("should fail if one arg", () => {
    const error = assertThrows(() => new CLIService().read(["foo"]));
    assert(error instanceof Error);
    assertEquals(error.message, 'Command line argument is not allowed: "foo"');
  });

  it("should fail if scanner option is a directory", () => {
    const error = assertThrows(() => new CLIService().read(["--scan=src"]));
    assert(error instanceof Error);
    assertEquals(error.message, 'Path is not a file: "src"');
  });

  it("should fail if one file arg", () => {
    const error = assertThrows(() => new CLIService().read(["README.md"]));
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Command line argument is not allowed: "README.md"',
    );
  });

  it("should create scanner", () => {
    const cliResult: CLI = new CLIService().read(["--scan=README.md"]);
    assert(cliResult.action instanceof ScannerAction);
    assertEquals(
      (cliResult.action as ScannerAction).configurationFile.path.value,
      "README.md",
    );
    assertFalse(cliResult.action.debug);
  });

  it("should create publisher", () => {
    const cliResult: CLI = new CLIService().read([
      "--publish",
      "--bluesky_login=login",
      "--bluesky_password=password",
    ]);
    assert(cliResult.action instanceof BlueskyPublisherAction);
  });

  it("should specify database", () => {
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

  it("should activate debug", () => {
    const cliResult: CLI = new CLIService().read([
      "--debug",
      "--scan=README.md",
    ]);
    assert(cliResult.action.debug);
    assert(cliResult.action.logger.transports.length === 1);
    assert(cliResult.action.logger.transports[0] instanceof ConsoleLogger);
  });

  it("should fail if debug prescan", () => {
    const error = assertThrows(() =>
      new CLIService().read(["--debug", "--prescan=config.yml"]),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--prescan" is not compatible with "--debug"',
    );
  });

  it("should fail if using a database with prescan", () => {
    const error = assertThrows(() =>
      new CLIService().read(["--database=db.sqlite", "--prescan=config.yml"]),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--prescan" is not compatible with "--database"',
    );
  });

  it("should fail if using scanner with bluesky publisher", () => {
    const error = assertThrows(() =>
      new CLIService().read([
        "--bluesky_host=https://bsky.social",
        "--prescan=config.yml",
      ]),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--prescan" or "--scan" is not compatible with "--bluesky_host", "--bluesky_login" or "--bluesky_password"',
    );
  });

  it("should fail if using a wrong logger", () => {
    const error = assertThrows(() =>
      new CLIService().read(["--scan=README.md", "--logger=foo"]),
    );
    assert(error instanceof Error);
    assertEquals(
      error.message,
      'Option "--logger" must be "batch" or "console"',
    );
  });

  it("should activate batch logger", () => {
    const cliResult: CLI = new CLIService().read([
      "--logger=batch",
      "--scan=README.md",
    ]);
    assert(cliResult.action.logger.transports.length === 1);
    assert(cliResult.action.logger.transports[0] instanceof BatchLogger);
  });
});
