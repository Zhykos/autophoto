import type { VideoGameScreenshot } from "../../../src/scanner/domain/entity/VideoGameScreenshot.ts";
import type { ImageRepository } from "../../../src/scanner/repository/ImageRepository.ts";

export class MockImageRepository implements ImageRepository {
  saveVideoGameScreenshots(_: VideoGameScreenshot[]): Promise<void> {
    return Promise.resolve();
  }

  getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]> {
    return Promise.resolve([]);
  }
}
