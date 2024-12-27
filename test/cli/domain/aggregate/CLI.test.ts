import { ConsoleLogger } from "@cross/log";
import { assert, assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  BatchLogger,
  CLI,
  type CLIBuilder,
} from "../../../../src/cli/domain/aggregate/CLI.ts";
import { LoggerStyle } from "../../../../src/cli/domain/valueobject/CLIAction.ts";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";

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
    const error = assertThrows(() => {
      const builder: CLIBuilder = CLI.builder();
      builder.withDatabaseFilepath("");
      builder.build();
    });
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });

  it("should fail if no action but debug", () => {
    const error = assertThrows(() => {
      const builder: CLIBuilder = CLI.builder();
      builder.withDebug();
      builder.build();
    });
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });

  it("should use batch logger", () => {
    const builder: CLIBuilder = CLI.builder();
    builder.withPreScanner(new File(new Path("README.md")));
    builder.withLogger(LoggerStyle.BATCH);
    const cli: CLI = builder.build();

    assertEquals(cli.action.logger.transports.length, 1);
    assert(cli.action.logger.transports[0] instanceof BatchLogger);
  });

  it("should use console logger by default", () => {
    const builder: CLIBuilder = CLI.builder();
    builder.withPreScanner(new File(new Path("README.md")));
    const cli: CLI = builder.build();

    assertEquals(cli.action.logger.transports.length, 1);
    assert(cli.action.logger.transports[0] instanceof ConsoleLogger);
  });

  it("should use console logger", () => {
    const builder: CLIBuilder = CLI.builder();
    builder.withPreScanner(new File(new Path("README.md")));
    builder.withLogger(LoggerStyle.CONSOLE);
    const cli: CLI = builder.build();

    assertEquals(cli.action.logger.transports.length, 1);
    assert(cli.action.logger.transports[0] instanceof ConsoleLogger);
  });

  it("should fail if no action but logger", () => {
    const error = assertThrows(() => {
      const builder: CLIBuilder = CLI.builder();
      builder.withLogger(LoggerStyle.CONSOLE);
      builder.build();
    });
    assert(error instanceof Error);
    assertEquals(
      error.message,
      "Action is required: prescanner, publisher or scanner",
    );
  });

  it("should log batch", () => {
    // Crappy test without any assertion, don't know how to test log output, but coverage is important even it's not a good test, at least it does not crash, don't do this at home it's bad practice
    const builder: CLIBuilder = CLI.builder();
    builder.withPreScanner(new File(new Path("README.md")));
    builder.withLogger(LoggerStyle.BATCH);
    const cli: CLI = builder.build();

    cli.action.logger.log("Hello, World!");
    cli.action.logger.error("Goodbye, World!");
  });
});
