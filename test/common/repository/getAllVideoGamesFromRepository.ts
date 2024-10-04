import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";
import type { VideoGameRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRepositoryEntity.ts";

export async function getAllVideoGamesFromRepository(
  databaseFilePath: string,
): Promise<VideoGameRepositoryEntity[]> {
  const kv: Deno.Kv = await Deno.openKv(databaseFilePath);
  const list: VideoGameRepositoryEntity[] = await KvDriver.list(
    kv,
    ["video-game"],
    {} as VideoGameRepositoryEntity,
  );
  kv.close();
  return list;
}
