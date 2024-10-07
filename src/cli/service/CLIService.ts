import { type Args, parseArgs } from "@std/cli/parse-args";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { pathExists } from "../../utils/file.ts";
import { CLI } from "../domain/aggregate/CLI.ts";

export class CLIService {
  read(cliArgs: string[]): CLI {
    const args: Args = parseArgs(cliArgs, {
      boolean: ["publish", "scan"],
      string: ["database"],
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

    let action: "SCAN" | "PUBLISH";
    if (args.publish) {
      action = "PUBLISH";
    } else if (args.scan) {
      action = "SCAN";
    } else {
      throw new Error('Missing option: "--scan" or "--publish"');
    }

    return new CLI(new File(new Path(filepath)), action, databaseFilepath);
  }
}
