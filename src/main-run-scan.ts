import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import {
  ScanData,
  type ScanDataBuilder,
} from "./x-scanner/domain/aggregate/ScanData.ts";
import { Scanner } from "./x-scanner/service/Scanner.ts";

const cli: CLI = new CLIService().read(Deno.args);

const scanDataBuilder: ScanDataBuilder =
  ScanData.builder().withConfigurationFilePath(cli.configuration);

if (cli.databaseFilepath) {
  scanDataBuilder.withDatabaseFilePath(cli.databaseFilepath);
}

const scanner = new Scanner(scanDataBuilder.build());

if (cli.cron) {
  Deno.cron("Schedule scan", cli.cron, async () => {
    console.log("Scanning scheduled...", new Date());
    await scan();
  });
} else {
  await scan();
}

async function scan(): Promise<void> {
  try {
    console.log("Scanning...");
    // TODO Alerting
    await scanner.scan();
    console.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    console.error("An error occurred while scanning.");
    console.error(error);
  } finally {
    scanner.destroy();
  }
}
