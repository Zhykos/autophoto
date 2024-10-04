import type { VideoGameRepository } from "../../../src/common/repository/VideoGameRepository.ts";
import type { VideoGame } from "../../../src/scanner/domain/entity/VideoGame.ts";

export class MockVideoGameRepository implements VideoGameRepository {
  saveVideoGames(_: VideoGame[]): Promise<void> {
    return Promise.resolve();
  }

  getAllVideoGames(): Promise<VideoGame[]> {
    return Promise.resolve([]);
  }
}
