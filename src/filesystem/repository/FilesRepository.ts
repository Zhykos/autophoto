import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { File } from "../domain/valueobject/File.ts";
import { Path } from "../domain/valueobject/Path.ts";
import type { FileEntity } from "./entity/FileEntity.ts";

export interface FilesRepository {
  saveFiles(files: File[]): Promise<void>;
  getAllFiles(): Promise<File[]>;
}

export class KvFilesRepository implements FilesRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveFiles(files: File[]): Promise<void> {
    const fileEntitiesPromises: Promise<FileEntity>[] = files.map(
      async (file) => {
        return {
          uuid: crypto.randomUUID(),
          path: file.path.value,
          checksum: await file.getChecksum(),
        } satisfies FileEntity;
      },
    );

    const fileEntities = await Promise.all(fileEntitiesPromises);

    for (const fileEntity of fileEntities) {
      await this.kvDriver.save(["file", fileEntity.uuid], fileEntity);
    }
  }

  async getAllFiles(): Promise<File[]> {
    const entities: FileEntity[] = await this.kvDriver.list(
      ["file"],
      {} as FileEntity,
    );
    return entities.map((entity) => {
      return new File(new Path(entity.path));
    });
  }
}
