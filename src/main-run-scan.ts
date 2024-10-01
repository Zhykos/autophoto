import { CLI } from "./cli/service/CLI.ts";
import type { File } from "./common/domain/valueobject/File.ts";
import { ScanData } from "./x-scanner/domain/aggregate/ScanData.ts";
import { Scanner } from "./x-scanner/service/Scanner.ts";

const configFile: File = new CLI().read(Deno.args);

const scanner = new Scanner(
  ScanData.builder().withConfigurationFilePath(configFile).build(),
);

try {
  console.log("Scanning...");
  await scanner.scan();
  console.log("Scan completed!");
} catch (error) {
  console.error("An error occurred while scanning.");
  console.error(error);
} finally {
  scanner.destroy();
}
