import { scan } from "./scan.ts";

Deno.cron("Schedule scan", "*/1 * * * *", async () => {
  try {
    console.log("Scanning scheduled...", new Date());
    await scan();
    console.log("Scan completed!");
  } catch (error) {
    // TODO Alerting
    console.error("An error occurred while scanning.");
    console.error(error);
  }
});
