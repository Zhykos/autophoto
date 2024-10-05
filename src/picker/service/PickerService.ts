import { unique } from "@radashi-org/radashi";
import { UnpublishedVideoGamesScreenshots } from "../domain/aggregate/UnpublishedVideoGamesScreenshots.ts";
import { VideoGameScreeshotsToShare } from "../domain/aggregate/VideoGameScreeshotsToShare.ts";
import type { Image } from "../domain/entity/Image.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "../domain/entity/UnpublishedVideoGameScreenshotRelation.ts";
import type { VideoGame } from "../domain/entity/VideoGame.ts";
import type { ImageRepository } from "../repository/ImageRepository.ts";
import type { RelationRepository } from "../repository/RelationRepository.ts";
import type { VideoGameRepository } from "../repository/VideoGameRepository.ts";

export class PickerService {
  constructor(
    private readonly relationRepository: RelationRepository,
    private readonly videoGameRepository: VideoGameRepository,
    private readonly imageRepository: ImageRepository,
  ) {}

  public async pick(): Promise<VideoGameScreeshotsToShare | undefined> {
    const unpublishedVideoGamesScreenshots: UnpublishedVideoGamesScreenshots =
      await this.getUnpublishedVideoGamesScreenshots();
    return new VideoGameScreeshotsToShare("8-Bit Bayonetta", "PC", ["1", "2"]);
  }

  private async getUnpublishedVideoGamesScreenshots(): Promise<UnpublishedVideoGamesScreenshots> {
    const unpublishedScreenshotRelations: UnpublishedVideoGameScreenshotRelation[] =
      await this.relationRepository.getUnpublishedVideoGameRelations();
    const unpublishedVideoGamesIDs: string[] = unique(
      unpublishedScreenshotRelations.map((rel) => rel.videoGameID),
    );
    const unpublishedVideoGames: VideoGame[] =
      await this.videoGameRepository.getVideoGames(unpublishedVideoGamesIDs);
    const unpublishedImagesIDs: string[] = unique(
      unpublishedScreenshotRelations.map((rel) => rel.imageID),
    );
    const unpublishedImages: Image[] =
      await this.imageRepository.getVideoGameScreenshots(unpublishedImagesIDs);
    return new UnpublishedVideoGamesScreenshots(
      unpublishedScreenshotRelations,
      unpublishedVideoGames,
      unpublishedImages,
    );
  }
}
