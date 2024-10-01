import { parseCronExpression } from "@p4sca1/cron-schedule";
import { type Args, parseArgs } from "@std/cli/parse-args";
import { File } from "../../common/domain/valueobject/File.ts";
import { Path } from "../../common/domain/valueobject/Path.ts";
import { pathExists } from "../../common/utils/file.ts";
import { CLI } from "../domain/aggregate/CLI.ts";

export class CLIService {
  read(cliArgs: string[]): CLI {
    const args: Args = parseArgs(cliArgs, {
      string: ["cron", "database"],
    });

    const configFiles: (string | number)[] = args._;

    if (configFiles.length !== 1) {
      throw new Error(
        `Command line must have only one argument: "${configFiles}"`,
      );
    }

    const filepath = configFiles[0] as string;
    if (!pathExists(filepath)) {
      throw new Error(
        `Command line argument must be an existing path: "${configFiles}"`,
      );
    }

    const cronStr: string | undefined = args.cron;
    if (cronStr) {
      try {
        parseCronExpression(cronStr);
      } catch (error) {
        throw new Error(`Invalid cron expression: "${cronStr}"`);
      }
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

    return new CLI(new File(new Path(filepath)), databaseFilepath, cronStr);
  }
}
