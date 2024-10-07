import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { CommonKvVideoGameRepository } from "../../common/repository/CommonKvVideoGameRepository.ts";
import type { VideoGameRepositoryEntity } from "../../common/repository/entity/VideoGameRepositoryEntity.ts";
import { VideoGame } from "../domain/entity/VideoGame.ts";

export interface VideoGameRepository {
  getVideoGames(filterIDs: string[]): Promise<VideoGame[]>;
}

export class KvVideoGameRepository implements VideoGameRepository {
  private readonly commonRepository: CommonKvVideoGameRepository;

  constructor(kvDriver: KvDriver) {
    this.commonRepository = new CommonKvVideoGameRepository(kvDriver);
  }

  async getVideoGames(filterIDs: string[]): Promise<VideoGame[]> {
    const entities: VideoGameRepositoryEntity[] =
      await this.commonRepository.getAllVideoGames();

    return entities
      .filter((entity) => filterIDs.includes(entity.uuid))
      .map(
        (entity) =>
          new VideoGame(entity.uuid, entity.title, entity.releaseYear),
      );
  }
}
