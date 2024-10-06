import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { ConfigurationService } from "./configuration/service/ConfigurationService.ts";
import { publish } from "./publish.ts";
import { runScanner } from "./scan.ts";

const cli: CLI = new CLIService().read(Deno.args);

const kvDriver = new KvDriver(cli.databaseFilepath);

const configuration: Configuration = new ConfigurationService().loadFile(
  cli.configuration.path.value,
);

try {
  if (cli.action === "SCAN") {
    await runScanner(configuration, kvDriver);
  } else {
    await publish(configuration, kvDriver);
  }
} finally {
  kvDriver.close();
}
