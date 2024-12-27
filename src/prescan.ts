import type { Log } from "@cross/log";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { VideoGamePlatform } from "./scanner/domain/valueobject/VideoGamePlatform.ts";
import { getFileInfo } from "./utils/file.ts";
import { pluralFinalS } from "./utils/plural-final-s.ts";
import { scanDirectory } from "./utils/scan-directory.ts";
import { formatNumber } from "./utils/format-number.ts";

const blueskyMaxFileSize = 976.56 * 1024;

export const preScan = (configuration: Configuration, logger: Log): boolean => {
  let filesCount = 0;
  let errorsCount = 0;

  for (const scan of configuration.scans) {
    const directory: string = scan.directory.path.value;
    logger.log(`Pre-scanning ${directory}...`);

    const platIndex: number = scan.pattern.groups.indexOf("platform");
    if (platIndex === -1) {
      logger.error(
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
        const fileInfo: Deno.FileInfo = getFileInfo(filepath) as Deno.FileInfo;

        if (fileInfo.size > blueskyMaxFileSize) {
          logger.error(
            `  - "${filepath}" is too big: ${fileInfo.size} bytes (max: ${blueskyMaxFileSize} bytes)`,
          );
          errorsCount++;
        } else {
          filesCount++;
        }
      } catch (_) {
        logger.error(`  - "${filepath}" has an invalid platform: ${group3}`);
        errorsCount++;
      }
    });
  }

  logger.log("Pre-scan completed!");
  logger.log(`Found ${formatNumber(filesCount)} ${pluralFinalS(filesCount, "file", false)}.`);

  if (errorsCount === 0) {
    logger.log("No errors found.");
  } else {
    logger.error(`Had ${pluralFinalS(errorsCount, "error")}.`);
  }

  return errorsCount === 0;
};
