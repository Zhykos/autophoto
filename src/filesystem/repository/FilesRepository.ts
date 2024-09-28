import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { FileEntity } from "../domain/entity/FileEntity.ts";
import { File } from "../domain/valueobject/File.ts";
import { Path } from "../domain/valueobject/Path.ts";
import type { FileEntity as FileRepositoryEntity } from "./entity/FileEntity.ts";

export interface FilesRepository {
  saveFiles(files: File[]): Promise<FileEntity[]>;
  getAllFiles(): Promise<File[]>;
}

export class KvFilesRepository implements FilesRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveFiles(files: File[]): Promise<FileEntity[]> {
    const result: FileEntity[] = [];

    const fileEntitiesPromises: Promise<FileRepositoryEntity>[] = files.map(
      async (file) => {
        const repositoryEntity: FileRepositoryEntity = {
          uuid: crypto.randomUUID(),
          path: file.path.value,
          checksum: await file.getChecksum(),
        } satisfies FileRepositoryEntity;

        result.push(new FileEntity(repositoryEntity.uuid, file));

        return repositoryEntity;
      },
    );

    const fileEntities: FileRepositoryEntity[] =
      await Promise.all(fileEntitiesPromises);

    for (const fileEntity of fileEntities) {
      await this.kvDriver.save(["file", fileEntity.uuid], fileEntity);
    }

    return result;
  }

  async getAllFiles(): Promise<File[]> {
    const entities: FileRepositoryEntity[] = await this.kvDriver.list(
      ["file"],
      {} as FileRepositoryEntity,
    );
    return entities.map((entity) => {
      return new File(new Path(entity.path));
    });
  }
}
