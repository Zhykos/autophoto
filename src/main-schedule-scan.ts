import { CLI } from "./cli/service/CLI.ts";
import type { File } from "./common/domain/valueobject/File.ts";
import { ScanData } from "./x-scanner/domain/aggregate/ScanData.ts";
import { Scanner } from "./x-scanner/service/Scanner.ts";

const configFile: File = new CLI().read(Deno.args);
const scanData = ScanData.builder()
  .withConfigurationFilePath(configFile)
  .build();

// Every minute
Deno.cron("Schedule scan", "*/1 * * * *", async () => {
  const scanner = new Scanner(scanData);

  try {
    console.log("Scanning scheduled...", new Date());
    await scanner.scan();
    // TODO Alerting
    console.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    console.error("An error occurred while scanning.");
    console.error(error);
  } finally {
    scanner.destroy();
  }
});
