import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { CommonKvVideoGameRepository } from "../../common/repository/CommonKvVideoGameRepository.ts";
import type { VideoGameRepositoryEntity } from "../../common/repository/entity/VideoGameRepositoryEntity.ts";
import { VideoGame } from "../domain/entity/VideoGame.ts";
import { VideoGameReleaseYear } from "../domain/valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../domain/valueobject/VideoGameTitle.ts";

export interface VideoGameRepository {
  saveVideoGames(videoGames: VideoGame[]): Promise<void>;
  getAllVideoGames(): Promise<VideoGame[]>;
}

export class KvVideoGameRepository implements VideoGameRepository {
  private readonly commonRepository: CommonKvVideoGameRepository;

  constructor(kvDriver: KvDriver) {
    this.commonRepository = new CommonKvVideoGameRepository(kvDriver);
  }

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

    await this.commonRepository.saveVideoGames(entities);
  }

  async getAllVideoGames(): Promise<VideoGame[]> {
    const entities: VideoGameRepositoryEntity[] =
      await this.commonRepository.getAllVideoGames();

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
