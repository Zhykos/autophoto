import type { VideoGame } from "../../../src/scanner/domain/entity/VideoGame.ts";
import type { VideoGameRepository } from "../../../src/scanner/repository/VideoGameRepository.ts";

export class MockVideoGameRepository implements VideoGameRepository {
  saveVideoGames(_: VideoGame[]): Promise<void> {
    return Promise.resolve();
  }

  getAllVideoGames(): Promise<VideoGame[]> {
    return Promise.resolve([]);
  }
}
