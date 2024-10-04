import type { ImageRepository } from "../../../src/common/repository/ImageRepository.ts";
import type { VideoGameScreenshot } from "../../../src/scanner/domain/entity/VideoGameScreenshot.ts";

export class MockImageRepository implements ImageRepository {
  saveVideoGameScreenshots(_: VideoGameScreenshot[]): Promise<void> {
    return Promise.resolve();
  }

  getAllVideoGameScreenshots(): Promise<VideoGameScreenshot[]> {
    return Promise.resolve([]);
  }
}
