import { type Args, parseArgs } from "@std/cli/parse-args";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { pathExists } from "../../utils/file.ts";
import { CLI, type CLIBuilder } from "../domain/aggregate/CLI.ts";

export class CLIService {
  read(cliArgs: string[]): CLI {
    const args: Args = parseArgs(cliArgs, {
      boolean: ["debug", "publish"],
      string: [
        "bluesky_host",
        "bluesky_login",
        "bluesky_passord",
        "database",
        "prescan",
        "scan",
      ],
    });

    const cliParameters: (string | number)[] = args._;
    if (cliParameters.length > 0) {
      throw new Error(
        `Command line argument is not allowed: "${cliParameters}"`,
      );
    }

    const cliBuilder: CLIBuilder = CLI.builder();

    this.checkArgs(args);

    if (args.publish === true) {
      cliBuilder.withBluesky(
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

    const databaseFilepath: string | undefined = args.database;
    if (databaseFilepath) {
      cliBuilder.withDatabaseFilepath(databaseFilepath);

      if (pathExists(databaseFilepath)) {
        console.log(`Using database file: ${databaseFilepath}`);
      } else {
        console.warn(
          `Database file not found, using a new one: ${databaseFilepath}`,
        );
      }
    }

    return cliBuilder.build();
  }

  private checkArgs(args: Args) {
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

    if (nbArgsOptions !== 1) {
      throw new Error(
        'Only one option allowed: "--prescan" or "--publish" or "--scan"',
      );
    }
  }
}
