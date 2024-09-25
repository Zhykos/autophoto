import { scan } from "./scan.ts";

try {
  console.log("Scanning...");
  await scan();
  console.log("Scan completed!");
} catch (error) {
  console.error("An error occurred while scanning.");
  console.error(error);
}
