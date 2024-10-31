import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { VideoGamePlatform } from "./scanner/domain/valueobject/VideoGamePlatform.ts";
import { scanDirectory } from "./utils/scan-directory.ts";

export const preScan = (configuration: Configuration): boolean => {
  let filesCount = 0;
  let errorsCount = 0;

  for (const scan of configuration.scans) {
    const directory: string = scan.directory.path.value;
    console.log(`Pre-scanning ${directory}...`);

    const platIndex: number = scan.pattern.groups.indexOf("platform");
    if (platIndex === -1) {
      console.error(
        `  - The pattern "${scan.pattern.regex.source}" does not have a "platform" group.`,
      );
      errorsCount++;
      continue;
    }

    scanDirectory(directory, scan.pattern.regex, (filepath) => {
      const regexResult: RegExpExecArray = scan.pattern.regex.exec(
        filepath,
      ) as RegExpExecArray;

      const group3: string = regexResult[3];
      try {
        new VideoGamePlatform(group3);
        filesCount++;
      } catch (_) {
        console.error(`  - "${filepath}" has an invalid platform: ${group3}`);
        errorsCount++;
      }
    });
  }

  console.log("Pre-scan completed!");
  console.log(`Found ${filesCount} files.`);
  console.log(`Had ${errorsCount} errors.`);

  return errorsCount > 0;
};
