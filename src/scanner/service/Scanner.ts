import type { ImageRepository } from "../../scanner/repository/ImageRepository.ts";
import type { RelationRepository } from "../../scanner/repository/RelationRepository.ts";
import type { VideoGameRepository } from "../../scanner/repository/VideoGameRepository.ts";
import type { ImageDirectory } from "../domain/aggregate/ImageDirectory.ts";
import {
  VideoGame,
  type VideoGameBuilder,
} from "../domain/entity/VideoGame.ts";
import { VideoGameScreenshot } from "../domain/entity/VideoGameScreenshot.ts";
import type { Image } from "../domain/valueobject/Image.ts";
import { VideoGamePlatform } from "../domain/valueobject/VideoGamePlatform.ts";

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
      await this.saveScreenshots(imageDirectory);
    await this.saveNewVideoGames(imageDirectory, newSavedScreenshots);
    await this.saveNewLinks(imageDirectory, newSavedScreenshots);
  }

  private async saveScreenshots(
    imageDirectory: ImageDirectory,
  ): Promise<VideoGameScreenshot[]> {
    const scannedImages: Image[] = await imageDirectory.scan();

    const repositoryScreenshots: VideoGameScreenshot[] =
      await this.imageRepository.getAllVideoGameScreenshots();

    const newScreenshotsToSave: VideoGameScreenshot[] = [];
    const screenshotsToUpdate: VideoGameScreenshot[] = [];

    for (const image of scannedImages) {
      const existingScreenshot: VideoGameScreenshot | undefined =
        repositoryScreenshots.find((screenshot) =>
          screenshot.image.equals(image),
        );

      if (existingScreenshot) {
        if (existingScreenshot.toUpdate === true) {
          screenshotsToUpdate.push(
            new VideoGameScreenshot(image, existingScreenshot.id),
          );
        }
      } else {
        newScreenshotsToSave.push(new VideoGameScreenshot(image));
      }
    }

    await this.imageRepository.saveVideoGameScreenshots(newScreenshotsToSave);
    await this.imageRepository.saveVideoGameScreenshots(screenshotsToUpdate);

    return newScreenshotsToSave;
  }

  private async saveNewVideoGames(
    imageDirectory: ImageDirectory,
    newSavedScreenshots: VideoGameScreenshot[],
  ): Promise<void> {
    const videoGamesFromScanner: VideoGame[] = [];

    for (const screenshot of newSavedScreenshots) {
      const videoGame: VideoGame = this.createVideoGame(
        imageDirectory,
        screenshot,
      );

      videoGamesFromScanner.find(
        (existingVideoGame) =>
          existingVideoGame.title.equals(videoGame.title) &&
          existingVideoGame.releaseYear.equals(videoGame.releaseYear),
      ) || videoGamesFromScanner.push(videoGame);
    }

    const repositoryVideoGames: VideoGame[] =
      await this.videoGameRepository.getAllVideoGames();

    const newVideoGamesToSave: VideoGame[] = videoGamesFromScanner.filter(
      (videoGame) =>
        !repositoryVideoGames.some(
          (existingVideoGame) =>
            existingVideoGame.title.equals(videoGame.title) &&
            existingVideoGame.releaseYear.equals(videoGame.releaseYear),
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
      const videoGameWithWuthoutID: VideoGame = this.createVideoGame(
        imageDirectory,
        screenshot,
      );

      const videoGameWithID: VideoGame = repositoryVideoGames.find(
        (existingVideoGame) =>
          existingVideoGame.title.equals(videoGameWithWuthoutID.title) &&
          existingVideoGame.releaseYear.equals(
            videoGameWithWuthoutID.releaseYear,
          ),
      ) as VideoGame;

      await this.relationRepository.saveVideoGameRelation(
        videoGameWithID,
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

    const group3: string = regexResult[3];
    return new VideoGamePlatform(group3);
  }

  private dataRegex(
    imageDirectory: ImageDirectory,
    screenshot: VideoGameScreenshot,
  ): RegExpExecArray {
    const filePath: string = screenshot.image.file.path.value
      .replace(imageDirectory.directory.path.value, "")
      .substring(1);

    return imageDirectory.fileFetchPattern.exec(filePath) as RegExpExecArray;
  }
}
