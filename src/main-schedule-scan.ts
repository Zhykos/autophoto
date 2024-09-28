import { ScanData } from "./x-scanner/domain/aggregate/ScanData.ts";
import { Scanner } from "./x-scanner/service/Scanner.ts";

// Every minute
Deno.cron("Schedule scan", "*/1 * * * *", async () => {
  const scanner = new Scanner(ScanData.builder().build());

  try {
    console.log("Scanning scheduled...", new Date());
    await scanner.scan();
    console.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    console.error("An error occurred while scanning.");
    console.error(error);
  } finally {
    scanner.destroy();
  }
});
