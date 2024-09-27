import { ScanData } from "./x-scanner/domain/aggregate/ScanData.ts";
import { Scanner } from "./x-scanner/service/Scanner.ts";

Deno.cron("Schedule scan", "*/1 * * * *", async () => {
  try {
    console.log("Scanning scheduled...", new Date());
    await new Scanner(ScanData.builder().build()).scan();
    console.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    console.error("An error occurred while scanning.");
    console.error(error);
  }
});
