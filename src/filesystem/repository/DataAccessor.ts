import { crypto } from "@std/crypto/crypto";
import { CommonKvAccessor } from "../../common/repository/CommonKvAccessor.ts";
import type { File } from "../domain/valueobject/File.ts";
import type { FileEntity } from "./entity/FileEntity.ts";

export interface DataAccessor {
  saveFiles(files: File[]): Promise<void>;
}

export class KvAccessor extends CommonKvAccessor implements DataAccessor {
  async saveFiles(files: File[]): Promise<void> {
    await this.getKv().then(async (kv) => {
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
        const encoder = new TextEncoder();
        const fileData = encoder.encode(JSON.stringify(fileEntity));
        await kv.set(["file", fileEntity.uuid], fileData);
      }
    });
  }

  async close(): Promise<void> {
    const kv = await this.getKv();
    kv.close();
  }
}
