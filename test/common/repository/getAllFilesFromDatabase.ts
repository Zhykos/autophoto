import type { FileEntity } from "../../../src/filesystem/repository/entity/FileEntity.ts";

export async function getAllFilesFromDatabase(
  databaseFilePath: string,
): Promise<FileEntity[]> {
  const result: FileEntity[] = [];
  const kv = await Deno.openKv(databaseFilePath);
  const entries = kv.list({ prefix: ["file"] });
  for await (const entry of entries) {
    const encoder = new TextDecoder();
    const fileData = encoder.decode(entry.value as BufferSource);
    result.push(JSON.parse(fileData) as FileEntity);
  }
  kv.close();
  return result;
}
