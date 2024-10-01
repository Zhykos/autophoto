import { type Args, parseArgs } from "@std/cli/parse-args";
import { File } from "../../common/domain/valubobject/File.ts";
import { Path } from "../../common/domain/valubobject/Path.ts";
import { pathExists } from "../../common/utils/file.ts";

export class CLI {
  read(cliArgs: string[]): File {
    const args: Args = parseArgs(cliArgs);
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

    return new File(new Path(filepath));
  }
}
