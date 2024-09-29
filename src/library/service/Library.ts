import type { VideoGameEntity } from "../domain/entity/VideoGameEntity.ts";
import type { LibraryRepository } from "../repository/LibraryRepository.ts";
import type { VideoGameEntity as VideoGameRepositoryEntity } from "../repository/entity/VideoGameEntity.ts";

export class Library {
  constructor(private readonly repository: LibraryRepository) {}

  public async saveVideoGames(
    videoGamesEntities: VideoGameRepositoryEntity[],
  ): Promise<void> {
    console.log("Saving library...");

    const allVideoGames: VideoGameEntity[] =
      await this.repository.getAllVideoGames();

    const videoGamesToSave: VideoGameRepositoryEntity[] =
      videoGamesEntities.filter((videoGameEntity) => {
        return !allVideoGames.some(
          (vg) =>
            vg.videoGame.title.value === videoGameEntity.title &&
            vg.videoGame.releaseYear.year === videoGameEntity.releaseYear,
        );
      });

    await this.repository.saveVideoGames(videoGamesToSave);
  }
}
