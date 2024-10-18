import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import type { BlueskyCredentials } from "./cli/domain/valueobject/BlueskyCredentials.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { ConfigurationService } from "./configuration/service/ConfigurationService.ts";
import { publish } from "./publish.ts";
import { runScanner } from "./scan.ts";

await main(Deno.args);

export async function main(cliArgs: string[]): Promise<void> {
  const cli: CLI = new CLIService().read(cliArgs);
  const kvDriver = new KvDriver(cli.databaseFilepath);

  try {
    const configuration: Configuration = new ConfigurationService().loadFile(
      cli.configuration.path.value,
    );

    if (cli.action.isScan()) {
      await runScanner(configuration, kvDriver, cli.debugDatabase);
    } else {
      const result: string | undefined = await publish(
        cli.action as BlueskyCredentials,
        kvDriver,
        cli.debugDatabase,
      );
      console.log("Publication result:", result);
    }
  } finally {
    kvDriver.close();
  }
}
