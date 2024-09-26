import type { ConfigurationScanWithPattern } from "../valueobject/ConfigurationScanWithPattern.ts";

export class Configuration {
  constructor(public readonly scans: ConfigurationScanWithPattern[]) {}
}
