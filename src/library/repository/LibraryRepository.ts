import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { VideoGame } from "../domain/valueobject/VideoGame.ts";
import { VideoGameReleaseYear } from "../domain/valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../domain/valueobject/VideoGameTitle.ts";
import type { VideoGameEntity } from "./entity/VideoGameEntity.ts";

export interface LibraryRepository {
  saveVideoGames(videoGames: VideoGame[]): Promise<void>;
  getAllVideoGames(): Promise<VideoGame[]>;
}

export class KvLibraryRepository implements LibraryRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGames(videoGames: VideoGame[]): Promise<void> {
    const videoGameEntities: VideoGameEntity[] = videoGames.map((videoGame) => {
      return {
        uuid: crypto.randomUUID(),
        title: videoGame.title.value,
        releaseYear: videoGame.releaseYear.year,
      } satisfies VideoGameEntity;
    });

    for (const videoGameEntity of videoGameEntities) {
      await this.kvDriver.save(
        ["library", "video-game", videoGameEntity.uuid],
        videoGameEntity,
      );
    }
  }

  async getAllVideoGames(): Promise<VideoGame[]> {
    const entities: VideoGameEntity[] = await this.kvDriver.list(
      ["library", "video-game"],
      {} as VideoGameEntity,
    );
    return entities.map((entity) => {
      return new VideoGame(
        new VideoGameTitle(entity.title),
        new VideoGameReleaseYear(entity.releaseYear),
      );
    });
  }
}
