import { Scanner } from "./x-scanner/service/Scanner.ts";

try {
  console.log("Scanning...");
  await new Scanner().scan();
  console.log("Scan completed!");
} catch (error) {
  console.error("An error occurred while scanning.");
  console.error(error);
}
