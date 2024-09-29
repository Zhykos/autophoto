import type { VideoGameFileLinkEntity } from "../../../src/x-scanner/repository/entity/VideoGameFileLinkEntity.ts";

export async function getAllLinksFromDatabase(
  databaseFilePath: string,
): Promise<VideoGameFileLinkEntity[]> {
  const result: VideoGameFileLinkEntity[] = [];
  const kv = await Deno.openKv(databaseFilePath);
  const entries = kv.list({ prefix: ["link"] });
  for await (const entry of entries) {
    const encoder = new TextDecoder();
    const fileData = encoder.decode(entry.value as BufferSource);
    result.push(JSON.parse(fileData) as VideoGameFileLinkEntity);
  }
  kv.close();
  return result;
}
