import type { ImageDirectory } from "../domain/aggregate/ImageDirectory.ts";
import {
  VideoGame,
  type VideoGameBuilder,
} from "../domain/entity/VideoGame.ts";
import { VideoGameScreenshot } from "../domain/entity/VideoGameScreenshot.ts";
import type { Image } from "../domain/valueobject/Image.ts";
import { VideoGamePlatform } from "../domain/valueobject/VideoGamePlatform.ts";
import type { ImageRepository } from "../repository/ImageRepository.ts";
import type { RelationRepository } from "../repository/RelationRepository.ts";
import type { VideoGameRepository } from "../repository/VideoGameRepository.ts";

export class Scanner {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly videoGameRepository: VideoGameRepository,
    private readonly relationRepository: RelationRepository,
  ) {}

  public async scanAndSaveNewImages(
    imageDirectory: ImageDirectory,
  ): Promise<void> {
    const newSavedScreenshots: VideoGameScreenshot[] =
      await this.saveNewScreenshots(imageDirectory);
    await this.saveNewVideoGames(imageDirectory, newSavedScreenshots);
    await this.saveNewLinks(imageDirectory, newSavedScreenshots);
  }

  private async saveNewScreenshots(
    imageDirectory: ImageDirectory,
  ): Promise<VideoGameScreenshot[]> {
    const scannedImages: Image[] = await imageDirectory.scan();

    const repositoryScreenshots: VideoGameScreenshot[] =
      await this.imageRepository.getAllVideoGameScreenshots();

    const newScreenshotsToSave: VideoGameScreenshot[] = scannedImages
      .filter(
        (image) =>
          !repositoryScreenshots.some((screenshot) =>
            screenshot.image.equals(image),
          ),
      )
      .map((image) => new VideoGameScreenshot(image));

    await this.imageRepository.saveVideoGameScreenshots(newScreenshotsToSave);

    return newScreenshotsToSave;
  }

  private async saveNewVideoGames(
    imageDirectory: ImageDirectory,
    newSavedScreenshots: VideoGameScreenshot[],
  ): Promise<void> {
    const videoGames: VideoGame[] = [];

    for (const screenshot of newSavedScreenshots) {
      const videoGame: VideoGame = this.createVideoGame(
        imageDirectory,
        screenshot,
      );

      videoGames.find(
        (exisingVideoGame) =>
          exisingVideoGame.title.equals(videoGame.title) &&
          exisingVideoGame.releaseYear.equals(videoGame.releaseYear),
      ) || videoGames.push(videoGame);
    }

    const repositoryVideoGames: VideoGame[] =
      await this.videoGameRepository.getAllVideoGames();

    const newVideoGamesToSave: VideoGame[] = videoGames.filter(
      (videoGame) =>
        !repositoryVideoGames.some((existingVideoGame) =>
          existingVideoGame.equals(videoGame),
        ),
    );

    await this.videoGameRepository.saveVideoGames(newVideoGamesToSave);
  }

  private createVideoGame(
    imageDirectory: ImageDirectory,
    screenshot: VideoGameScreenshot,
  ): VideoGame {
    const regexResult: RegExpExecArray = this.dataRegex(
      imageDirectory,
      screenshot,
    );

    const group1: string = regexResult[1];
    const group2: string = regexResult[2];

    const builder: VideoGameBuilder = VideoGame.builder();

    if (imageDirectory.fileFetchPatternGroups[0] === "title") {
      builder.withTitle(group1);
    }

    if (imageDirectory.fileFetchPatternGroups[1] === "release-year") {
      builder.withReleaseYear(Number.parseInt(group2));
    }

    return builder.build();
  }

  private async saveNewLinks(
    imageDirectory: ImageDirectory,
    newSavedScreenshots: VideoGameScreenshot[],
  ): Promise<void> {
    const repositoryVideoGames: VideoGame[] =
      await this.videoGameRepository.getAllVideoGames();

    for (const screenshot of newSavedScreenshots) {
      const videoGameWithWrongID: VideoGame = this.createVideoGame(
        imageDirectory,
        screenshot,
      );

      const videoGame: VideoGame | undefined = repositoryVideoGames.find(
        (existingVideoGame) =>
          existingVideoGame.title.equals(videoGameWithWrongID.title) &&
          existingVideoGame.releaseYear.equals(
            videoGameWithWrongID.releaseYear,
          ),
      );

      if (!videoGame) {
        throw new Error(
          `Video game not found in repository: ${videoGameWithWrongID.title} (${videoGameWithWrongID.releaseYear})`,
        );
      }

      await this.relationRepository.saveVideoGameRelation(
        videoGame,
        screenshot,
        this.createVideoGamePlatform(imageDirectory, screenshot),
      );
    }
  }

  private createVideoGamePlatform(
    imageDirectory: ImageDirectory,
    screenshot: VideoGameScreenshot,
  ): VideoGamePlatform {
    const regexResult: RegExpExecArray = this.dataRegex(
      imageDirectory,
      screenshot,
    );

    const group3: string = regexResult[2];
    return new VideoGamePlatform(group3);
  }

  private dataRegex(
    imageDirectory: ImageDirectory,
    screenshot: VideoGameScreenshot,
  ): RegExpExecArray {
    const filePath: string = screenshot.image.file.path.value
      .replace(imageDirectory.directory.rootDir.value, "")
      .substring(1);

    return imageDirectory.fileFetchPattern.exec(filePath) as RegExpExecArray;
  }
}
