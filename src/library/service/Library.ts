import type { Library as LibraryDomain } from "../domain/aggregate/Library.ts";
import type { VideoGame } from "../domain/valueobject/VideoGame.ts";
import type { LibraryRepository } from "../repository/LibraryRepository.ts";

export class Library {
  constructor(private readonly repository: LibraryRepository) {}

  public async saveVideoGames(newVideoGames: VideoGame[]): Promise<void> {
    console.log("Saving library...");

    const allVideoGames: VideoGame[] = await this.repository.getAllVideoGames();

    const videoGamesToSave: VideoGame[] = newVideoGames.filter((videoGame) => {
      return !allVideoGames.some((vg) => vg.equals(videoGame));
    });

    await this.repository.saveVideoGames(videoGamesToSave);
  }
}
