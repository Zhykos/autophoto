import { distinct } from "@std/collections";
import { shuffle } from "@std/random";
import { UnpublishedVideoGamesScreenshot } from "../domain/aggregate/UnpublishedVideoGamesScreenshot.ts";
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
    const unpublishedVideoGamesScreenshots: UnpublishedVideoGamesScreenshot[] =
      await this.getUnpublishedVideoGamesScreenshots();

    if (unpublishedVideoGamesScreenshots.length === 0) {
      return undefined;
    }

    const possibilitiesPriority: UnpublishedVideoGamesScreenshot[] =
      unpublishedVideoGamesScreenshots.filter(
        (screenshot) => screenshot.images.length >= 4,
      );

    if (possibilitiesPriority.length > 0) {
      return this.pickScreenshotsToShare(possibilitiesPriority);
    }

    const mapByLength = new Map<number, UnpublishedVideoGamesScreenshot[]>();
    for (const screenshot of unpublishedVideoGamesScreenshots) {
      const length: number = screenshot.images.length;
      if (!mapByLength.has(length)) {
        mapByLength.set(length, []);
      }
      mapByLength.get(length)?.push(screenshot);
    }
    return this.pickScreenshotsToShare(
      mapByLength.get(3) ??
        mapByLength.get(2) ??
        (mapByLength.get(1) as UnpublishedVideoGamesScreenshot[]),
    );
  }

  private pickScreenshotsToShare(
    unpublishedVideoGamesScreenshots: UnpublishedVideoGamesScreenshot[],
  ): VideoGameScreeshotsToShare {
    const picked: UnpublishedVideoGamesScreenshot =
      unpublishedVideoGamesScreenshots[
        Math.floor(Math.random() * unpublishedVideoGamesScreenshots.length)
      ];

    return new VideoGameScreeshotsToShare(
      picked.videoGame.title,
      picked.platform,
      picked.videoGame.releaseYear,
      shuffle(picked.images).slice(0, 4),
    );
  }

  private async getUnpublishedVideoGamesScreenshots(): Promise<
    UnpublishedVideoGamesScreenshot[]
  > {
    const unpublishedScreenshotRelations: UnpublishedVideoGameScreenshotRelation[] =
      await this.relationRepository.getUnpublishedVideoGameRelations();
    const unpublishedVideoGamesIDs: string[] = distinct(
      unpublishedScreenshotRelations.map((rel) => rel.videoGameID),
    );
    const unpublishedVideoGames: VideoGame[] =
      await this.videoGameRepository.getVideoGames(unpublishedVideoGamesIDs);
    const unpublishedImagesIDs: string[] = distinct(
      unpublishedScreenshotRelations.map((rel) => rel.imageID),
    );
    const unpublishedImages: Image[] =
      await this.imageRepository.getVideoGameScreenshots(unpublishedImagesIDs);
    return UnpublishedVideoGamesScreenshot.buildAll(
      unpublishedScreenshotRelations,
      unpublishedVideoGames,
      unpublishedImages,
    );
  }
}
