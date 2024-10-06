import type { CLI } from "./cli/domain/aggregate/CLI.ts";
import { CLIService } from "./cli/service/CLIService.ts";
import { runScanner } from "./scan.ts";

const cli: CLI = new CLIService().read(Deno.args);
if (cli.action === "SCAN") {
  await runScanner(cli);
} else {
  // TODO: Implement publish action
  console.log("Publishing...");
}
