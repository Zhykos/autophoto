import type { Log } from "@cross/log";
import { type Args, parseArgs } from "@std/cli/parse-args";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { pathExists } from "../../utils/file.ts";
import { CLI, type CLIBuilder } from "../domain/aggregate/CLI.ts";

export class CLIService {
  read(cliArgs: string[]): CLI {
    const args: Args = parseArgs(cliArgs, {
      boolean: ["debug", "publish", "stats"],
      string: [
        "bluesky_host",
        "bluesky_login",
        "bluesky_passord",
        "database",
        "logger",
        "prescan",
        "scan",
      ],
    });

    this.checkArgs(args);

    const cliBuilder: CLIBuilder = CLI.builder();

    if (args.publish === true) {
      cliBuilder.publishImagesToBluesky(
        args.bluesky_host
          ? new URL(args.bluesky_host)
          : new URL("https://bsky.social"),
        args.bluesky_login,
        args.bluesky_password,
      );
    } else if (args.stats === true) {
      cliBuilder.publishStatsToBluesky(
        args.bluesky_host
          ? new URL(args.bluesky_host)
          : new URL("https://bsky.social"),
        args.bluesky_login,
        args.bluesky_password,
      );
    } else if (args.scan) {
      cliBuilder.withScanner(new File(new Path(args.scan)));
    } else {
      cliBuilder.withPreScanner(new File(new Path(args.prescan)));
    }

    if (args.debug === true) {
      cliBuilder.withDebug();
    }

    const logger: Log = cliBuilder.withLogger(args.logger);

    const databaseFilepath: string | undefined = args.database;
    if (databaseFilepath) {
      cliBuilder.withDatabaseFilepath(databaseFilepath);

      if (pathExists(databaseFilepath)) {
        logger.log(`Using database file: "${databaseFilepath}".`);
      } else {
        logger.warn(
          `Database file not found, using a new one: "${databaseFilepath}".`,
        );
      }
    }

    return cliBuilder.build();
  }

  private checkArgs(args: Args): void {
    const cliParameters: (string | number)[] = args._;
    if (cliParameters.length > 0) {
      throw new Error(
        `Command line argument is not allowed: "${cliParameters}".`,
      );
    }

    this.onlyOneArg(args);
    this.checkArgsCombination(args);
    this.checkLoggerArg(args);
  }

  private onlyOneArg(args: Args): void {
    let nbArgsOptions = 0;

    if (args.publish) {
      nbArgsOptions++;
    }

    if (args.scan) {
      nbArgsOptions++;
    }

    if (args.prescan) {
      nbArgsOptions++;
    }

    if (args.stats) {
      nbArgsOptions++;
    }

    if (nbArgsOptions !== 1) {
      throw new Error(
        'Only one option allowed: "--prescan" or "--publish" or "--scan" or "--stats".',
      );
    }
  }

  private checkArgsCombination(args: Args): void {
    if (args.prescan && args.debug) {
      throw new Error('Option "--prescan" is not compatible with "--debug".');
    }

    if (args.prescan && args.database) {
      throw new Error(
        'Option "--prescan" is not compatible with "--database".',
      );
    }

    if (
      (args.prescan || args.scan) &&
      (args.bluesky_host || args.bluesky_login || args.bluesky_password)
    ) {
      throw new Error(
        'Option "--prescan" or "--scan" is not compatible with "--bluesky_host", "--bluesky_login" or "--bluesky_password".',
      );
    }
  }

  private checkLoggerArg(args: Args): void {
    if (args.logger) {
      if (!["batch", "console"].includes(args.logger)) {
        throw new Error('Option "--logger" must be "batch" or "console".');
      }
    }
  }
}
