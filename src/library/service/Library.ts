import type { VideoGame } from "../domain/valueobject/VideoGame.ts";
import type { LibraryRepository } from "../repository/LibraryRepository.ts";
import type { VideoGameEntity } from "../repository/entity/VideoGameEntity.ts";

export class Library {
  constructor(private readonly repository: LibraryRepository) {}

  public async saveVideoGames(
    videoGamesEntities: VideoGameEntity[],
  ): Promise<void> {
    console.log("Saving library...");

    const allVideoGames: VideoGame[] = await this.repository.getAllVideoGames();

    const videoGamesToSave: VideoGameEntity[] = videoGamesEntities.filter(
      (videoGameEntity) => {
        return !allVideoGames.some(
          (vg) =>
            vg.title.value === videoGameEntity.title &&
            vg.releaseYear.year === videoGameEntity.releaseYear,
        );
      },
    );

    await this.repository.saveVideoGames(videoGamesToSave);
  }
}
