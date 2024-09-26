import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import { FileType as ConfigurationFileType } from "./configuration/domain/valueobject/FileType.ts";
import { ReadConfiguration } from "./configuration/service/ReadConfiguration.ts";
import { ScanData } from "./filesystem/domain/aggregate/ScanData.ts";
import { Directory } from "./filesystem/domain/valueobject/Directory.ts";
import { FileType as FileSystemFileType } from "./filesystem/domain/valueobject/FileType.ts";
import { Path } from "./filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "./filesystem/repository/FilesRepository.ts";
import { KvAccessor } from "./filesystem/repository/KvAccessor/KvAccessor.ts";
import { Scan } from "./filesystem/service/Scan.ts";

export const scan = async (): Promise<void> => {
  const scanData: ScanData[] = readConfiguration();
  const fileRepository = new FilesRepository(new KvAccessor());
  const scanner = new Scan(fileRepository);
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

    const directoryType = mapFileType(scan.fileType);
    scanData.push(new ScanData(directoryToScan, directoryType));
  }

  // TODO Also save library (video game)

  return scanData;
};

const mapFileType = (fileType: ConfigurationFileType): FileSystemFileType => {
  if (fileType === ConfigurationFileType["video-game"]) {
    return FileSystemFileType.VIDEO_GAME;
  }

  throw new Error(`Invalid file type: ${fileType}`);
};
