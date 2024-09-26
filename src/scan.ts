import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { ReadConfiguration } from "./configuration/service/ReadConfiguration.ts";
import { ScanData } from "./filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "./filesystem/domain/valueobject/Directory.ts";
import { Path } from "./filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "./filesystem/repository/FilesRepository.ts";
import { KvAccessor } from "./filesystem/repository/KvAccessor/KvAccessor.ts";
import { Scanner } from "./filesystem/service/Scanner.ts";

export const scan = async (
  configurationFilePath = "./config.yml",
  databaseFilePath = "./db.autophoto.sqlite3",
): Promise<void> => {
  const accessor = new KvAccessor(databaseFilePath);

  try {
    const scanData: ScanData[] = readConfiguration(configurationFilePath);
    const fileRepository = new FilesRepository(accessor);
    const scanner = new Scanner(fileRepository);
    for (const data of scanData) {
      console.log(`Scanning ${data.directory.rootDir.value}`);
      await scanner.scanAndSave(data);
    }
  } finally {
    accessor.close();
  }
};

const readConfiguration = (configurationFilePath: string): ScanData[] => {
  const configuration: Configuration = new ReadConfiguration().load(
    configurationFilePath,
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
