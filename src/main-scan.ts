import { Directory } from "./filesystem/domain/valueobject/Directory.ts";
import { FileType } from "./filesystem/domain/valueobject/FileType.ts";
import { Path } from "./filesystem/domain/valueobject/Path.ts";
import { FilesRepository } from "./filesystem/repository/FilesRepository.ts";
import { KvAccessor } from "./filesystem/repository/KvAccessor/KvAccessor.ts";
import { Scan } from "./filesystem/service/Scan.ts";

const fileRepository = new FilesRepository(new KvAccessor());
const directoryToScan = new Directory(new Path("./test/resources/video-game"));
const directoryType = FileType.VIDEO_GAME;

new Scan(fileRepository).scanAndSave(directoryToScan, directoryType);
