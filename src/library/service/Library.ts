import type { LibraryRepository } from "../repository/LibraryRepository.ts";
import type { VideoGameEntity as VideoGameRepositoryEntity } from "../repository/entity/VideoGameEntity.ts";

export class Library {
  constructor(private readonly repository: LibraryRepository) {}

  public async saveVideoGames(
    videoGamesToSave: VideoGameRepositoryEntity[],
  ): Promise<void> {
    console.log("Saving library...");
    await this.repository.saveVideoGames(videoGamesToSave);
  }
}
