import { crypto } from "@std/crypto/crypto";
import { CommonKvAccessor } from "../../../common/repository/CommonKvAccessor.ts";
import type { File } from "../../domain/valueobject/File.ts";
import type { FileType } from "../../domain/valueobject/FileType.ts";
import type { DataAccessor } from "../DataAccessor.ts";
import type { FileEntity } from "../entity/FileEntity.ts";

export class KvAccessor extends CommonKvAccessor implements DataAccessor {
  saveFiles(files: File[], type: FileType): Promise<void> {
    this.getKv().then(async (kv) => {
      const fileEntitiesPromises: Promise<FileEntity>[] = files.map(
        async (file) => {
          return {
            uuid: crypto.randomUUID(),
            path: file.path.value,
            checksum: await file.getChecksum(),
            type,
          } satisfies FileEntity;
        },
      );

      const fileEntities = await Promise.all(fileEntitiesPromises);

      for (const fileEntity of fileEntities) {
        const encoder = new TextEncoder();
        const fileData = encoder.encode(JSON.stringify(fileEntity));
        kv.set(["file", fileEntity.type, fileEntity.uuid], fileData);
      }
    });

    return Promise.resolve();
  }
}
