import type { Image } from "../entity/Image.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "../entity/UnpublishedVideoGameScreenshotRelation.ts";
import type { VideoGame } from "../entity/VideoGame.ts";

export class UnpublishedVideoGamesScreenshots {
  constructor(
    unpublishedScreenshotRelations: UnpublishedVideoGameScreenshotRelation[],
    unpublishedVideoGames: VideoGame[],
    unpublishedImages: Image[],
  ) {
    // implementation
  }
}
