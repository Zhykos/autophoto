import type { VideoGameEntity } from "../../../src/library/repository/entity/VideoGameEntity.ts";

export async function getAllVideoGamesFromDatabase(
  databaseFilePath: string,
): Promise<VideoGameEntity[]> {
  const result: VideoGameEntity[] = [];
  const kv = await Deno.openKv(databaseFilePath);
  const entries = kv.list({ prefix: ["library", "video-game"] });
  for await (const entry of entries) {
    const encoder = new TextDecoder();
    const fileData = encoder.decode(entry.value as BufferSource);
    result.push(JSON.parse(fileData) as VideoGameEntity);
  }
  kv.close();
  return result;
}
