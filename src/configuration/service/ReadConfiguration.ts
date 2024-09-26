import { parse } from "@std/yaml";
import { fileExists } from "../../common/utils/file.ts";
import { Configuration } from "../domain/aggregate/Configuration.ts";
import { ConfigurationDataPattern } from "../domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../domain/valueobject/ConfigurationScanWithPattern.ts";
import { Directory } from "../domain/valueobject/Directory.ts";
import { DirectoryType } from "../domain/valueobject/DirectoryType.ts";
import { Path } from "../domain/valueobject/Path.ts";
import type { ConfigurationYamlType } from "./ConfigurationYamlType.ts";

export class ReadConfiguration {
  public load(configurationFile: string): Configuration {
    if (!fileExists(configurationFile)) {
      throw new Error(`Configuration file not found: "${configurationFile}"`);
    }

    const configStr: string = Deno.readTextFileSync(configurationFile);
    const config = parse(configStr) as ConfigurationYamlType;
    if (config?.autophoto?.scan && Array.isArray(config.autophoto.scan)) {
      const scans: ConfigurationScanWithPattern[] = this.parseScans(config);
      return new Configuration(scans);
    }

    throw new Error(`Invalid configuration file: "${configurationFile}"`);
  }

  private parseScans(
    config: ConfigurationYamlType,
  ): ConfigurationScanWithPattern[] {
    const configPatterns: ConfigurationScanWithPattern[] = [];

    for (const scan of config.autophoto.scan) {
      if (!scan.directory || !scan.type || !scan["data-pattern"]) {
        throw new Error(`Invalid configuration scan: ${JSON.stringify(scan)}`);
      }

      const directory = new Directory(new Path(scan.directory));
      const directoryType: DirectoryType = ReadConfiguration.getDirectoryType(
        scan.type,
      );
      const pattern = new ConfigurationDataPattern(
        new RegExp(scan["data-pattern"].regex),
        scan["data-pattern"].groups,
      );

      configPatterns.push(
        new ConfigurationScanWithPattern(directory, directoryType, pattern),
      );
    }

    return configPatterns;
  }

  private static getDirectoryType(type: string): DirectoryType {
    if (type === "video-game") {
      return DirectoryType["video-game"];
    }

    throw new Error(`Invalid directory type: "${type}"`);
  }
}
