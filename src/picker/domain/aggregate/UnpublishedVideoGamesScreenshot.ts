import type { Image } from "../entity/Image.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "../entity/UnpublishedVideoGameScreenshotRelation.ts";
import type { VideoGame } from "../entity/VideoGame.ts";

export class UnpublishedVideoGamesScreenshot {
  private constructor(
    private readonly videoGame: VideoGame,
    private readonly platform: string,
    private readonly images: Image[],
  ) {}

  static buildAll(
    unpublishedScreenshotRelations: UnpublishedVideoGameScreenshotRelation[],
    unpublishedVideoGames: VideoGame[],
    unpublishedImages: Image[],
  ): UnpublishedVideoGamesScreenshot[] {
    // TODO
    return [];
  }
}
