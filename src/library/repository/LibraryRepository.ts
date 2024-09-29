import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { VideoGameEntity } from "../domain/entity/VideoGameEntity.ts";
import { VideoGame } from "../domain/valueobject/VideoGame.ts";
import { VideoGameReleaseYear } from "../domain/valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../domain/valueobject/VideoGameTitle.ts";
import type { VideoGameEntity as VideoGameRepositoryEntity } from "./entity/VideoGameEntity.ts";

export interface LibraryRepository {
  saveVideoGames(
    videoGamesEntities: VideoGameRepositoryEntity[],
  ): Promise<void>;
  getAllVideoGames(): Promise<VideoGameEntity[]>;
}

export class KvLibraryRepository implements LibraryRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGames(
    videoGamesEntities: VideoGameRepositoryEntity[],
  ): Promise<void> {
    for (const videoGameEntity of videoGamesEntities) {
      await this.kvDriver.save(
        ["library", "video-game", videoGameEntity.uuid],
        videoGameEntity,
      );
    }
  }

  async getAllVideoGames(): Promise<VideoGameEntity[]> {
    const entities: VideoGameRepositoryEntity[] = await this.kvDriver.list(
      ["library", "video-game"],
      {} as VideoGameRepositoryEntity,
    );

    return entities.map((entity) => {
      const videoGame = new VideoGame(
        new VideoGameTitle(entity.title),
        new VideoGameReleaseYear(entity.releaseYear),
      );

      return new VideoGameEntity(entity.uuid, videoGame);
    });
  }
}
