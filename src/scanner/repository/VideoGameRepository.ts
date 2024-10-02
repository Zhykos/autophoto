import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { VideoGame } from "../domain/entity/VideoGame.ts";
import { VideoGameReleaseYear } from "../domain/valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../domain/valueobject/VideoGameTitle.ts";
import type { VideoGameRepositoryEntity } from "./entity/VideoGameRepositoryEntity.ts";

export interface VideoGameRepository {
  saveVideoGames(videoGames: VideoGame[]): Promise<void>;
  getAllVideoGames(): Promise<VideoGame[]>;
}

export class KvVideoGameRepository implements VideoGameRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGames(videoGames: VideoGame[]): Promise<void> {
    const entities: VideoGameRepositoryEntity[] = videoGames.map(
      (videoGame) => {
        return {
          uuid: videoGame.id,
          title: videoGame.title.value,
          releaseYear: videoGame.releaseYear.year,
        } satisfies VideoGameRepositoryEntity;
      },
    );

    for (const entity of entities) {
      await this.kvDriver.save(["video-game", entity.uuid], entity);
    }
  }

  async getAllVideoGames(): Promise<VideoGame[]> {
    const entities: VideoGameRepositoryEntity[] = await this.kvDriver.list(
      ["video-game"],
      {} as VideoGameRepositoryEntity,
    );

    return entities.map(
      (entity) =>
        new VideoGame(
          new VideoGameTitle(entity.title),
          new VideoGameReleaseYear(entity.releaseYear),
          entity.uuid,
        ),
    );
  }
}
