import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../../src/scanner/repository/entity/VideoGameRelationImageRepositoryEntity.ts";

export async function getAllRelationsFromRepository(
  databaseFilePath: string,
): Promise<VideoGameRelationImageRepositoryEntity[]> {
  const kv: Deno.Kv = await Deno.openKv(databaseFilePath);
  const list: VideoGameRelationImageRepositoryEntity[] = await KvDriver.list(
    kv,
    ["relation"],
    {} as VideoGameRelationImageRepositoryEntity,
  );
  kv.close();
  return list;
}
