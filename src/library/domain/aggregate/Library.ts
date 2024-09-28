import type { LibraryObject } from "../valueobject/LibraryObject.ts";
import { VideoGame } from "../valueobject/VideoGame.ts";

export class Library {
  private objects: LibraryObject[] = [];

  public addVideoGame(videoGame: VideoGame): void {
    if (!this.objects.find((obj) => obj.equals(videoGame))) {
      this.objects.push(videoGame);
    }
  }

  public getVideoGames(): VideoGame[] {
    return this.objects.filter((obj) => obj instanceof VideoGame);
  }
}
