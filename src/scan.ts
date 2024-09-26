import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { ReadConfiguration } from "./configuration/service/ReadConfiguration.ts";
import { ScanData } from "./filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "./filesystem/domain/valueobject/Directory.ts";
import { Path } from "./filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "./filesystem/repository/FilesRepository.ts";
import { KvAccessor } from "./filesystem/repository/KvAccessor/KvAccessor.ts";
import { Scanner } from "./filesystem/service/Scanner.ts";

export const scan = async (): Promise<void> => {
  const scanData: ScanData[] = readConfiguration();
  const fileRepository = new FilesRepository(new KvAccessor());
  const scanner = new Scanner(fileRepository);
  for (const data of scanData) {
    await scanner.scanAndSave(data);
  }
};

const readConfiguration = (): ScanData[] => {
  const configuration: Configuration = new ReadConfiguration().load(
    "./config.yml",
  );

  const scanData: ScanData[] = [];

  for (const scan of configuration.scans) {
    const directoryToScan = new Directory(
      new Path(scan.directory.rootDir.value),
    );

    scanData.push(new ScanData(directoryToScan, scan.pattern.regex));
  }

  // TODO Also save library (video game)

  return scanData;
};
