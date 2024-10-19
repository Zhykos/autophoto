import { type Args, parseArgs } from "@std/cli/parse-args";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { pathExists } from "../../utils/file.ts";
import { CLI, type CLIBuilder } from "../domain/aggregate/CLI.ts";

export class CLIService {
  read(cliArgs: string[]): CLI {
    const args: Args = parseArgs(cliArgs, {
      boolean: ["debug-database", "publish", "scan"],
      string: ["bluesky_host", "bluesky_login", "bluesky_passord", "database"],
    });

    const cliParameters: (string | number)[] = args._;

    if (cliParameters.length !== 1) {
      throw new Error(
        `Command line must have only one argument: "${cliParameters}"`,
      );
    }

    const filepath = cliParameters[0] as string;
    if (!pathExists(filepath)) {
      throw new Error(
        `Command line argument must be an existing path: "${cliParameters}"`,
      );
    }

    const databaseFilepath: string | undefined = args.database;
    if (databaseFilepath) {
      if (pathExists(databaseFilepath)) {
        console.log(`Using database file: ${databaseFilepath}`);
      } else {
        console.warn(
          `Database file not found, using a new one: ${databaseFilepath}`,
        );
      }
    }

    const cliBuilder: CLIBuilder = CLI.builder()
      .withConfiguration(new File(new Path(filepath)))
      .withDatabaseFilepath(databaseFilepath);

    if (args["debug-database"] === true) {
      cliBuilder.withDebugDatabase();
    }

    if (args.publish === true) {
      cliBuilder.withBluesky(
        args.bluesky_host
          ? new URL(args.bluesky_host)
          : new URL("https://bsky.social"),
        args.bluesky_login,
        args.bluesky_password,
      );
    } else if (args.scan === true) {
      cliBuilder.withScanner();
    } else {
      throw new Error('Missing option: "--scan" or "--publish"');
    }

    return cliBuilder.build();
  }
}
