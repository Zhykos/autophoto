import { KvDriver } from "../../src/common/dbdriver/KvDriver.ts";
import type { ImageRepositoryRepositoryEntity } from "../../src/common/repository/entity/ImageRepositoryRepositoryEntity.ts";

export async function getAllImagesFromRepository(
  databaseFilePath: string,
): Promise<ImageRepositoryRepositoryEntity[]> {
  const kv: Deno.Kv = await Deno.openKv(databaseFilePath);
  const list: ImageRepositoryRepositoryEntity[] = await KvDriver.list(
    kv,
    ["image"],
    {} as ImageRepositoryRepositoryEntity,
  );
  kv.close();
  return list;
}
