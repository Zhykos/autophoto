import { runScanner, scan } from "./run-scan.ts";

await runScanner(Deno.args, async (cli, scanner, configuration) => {
  if (cli.cron) {
    Deno.cron("Schedule scan", cli.cron, async () => {
      console.log("Scanning scheduled...", new Date());
      await scan(scanner, configuration.scans);
    });
  } else {
    await scan(scanner, configuration.scans);
  }
});
