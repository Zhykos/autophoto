import { ScanData } from "./x-scanner/domain/aggregate/ScanData.ts";
import { Scanner } from "./x-scanner/service/Scanner.ts";

const scanner = new Scanner(ScanData.builder().build());

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
