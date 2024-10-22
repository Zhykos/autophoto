import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { VideoGameRepositoryEntity } from "./entity/VideoGameRepositoryEntity.ts";

export class CommonKvVideoGameRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGames(entities: VideoGameRepositoryEntity[]): Promise<void> {
    for (const entity of entities) {
      await this.kvDriver.save(["video-game", entity.uuid], entity);
    }
  }

  async getAllVideoGames(): Promise<VideoGameRepositoryEntity[]> {
    return await this.kvDriver.list(
      ["video-game"],
      {} as VideoGameRepositoryEntity,
    );
  }
}
