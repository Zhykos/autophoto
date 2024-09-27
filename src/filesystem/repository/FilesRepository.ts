import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FileEntity } from "./entity/FileEntity.ts";

export interface FilesRepository {
  saveFiles(files: File[]): Promise<void>;
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
}
