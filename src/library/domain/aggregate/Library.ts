import type { VideoGame } from "../valueobject/VideoGame.ts";

export class Library {
  private videoGames: VideoGame[] = [];

  public addVideoGame(videoGame: VideoGame): void {
    this.videoGames.push(videoGame);
  }

  public getVideoGames(): ReadonlyArray<VideoGame> {
    return this.videoGames;
  }
}
