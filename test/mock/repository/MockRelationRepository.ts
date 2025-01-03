import type { VideoGameRelationImageRepositoryEntity } from "../../../src/common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGame } from "../../../src/scanner/domain/entity/VideoGame.ts";
import type { VideoGameScreenshot } from "../../../src/scanner/domain/entity/VideoGameScreenshot.ts";
import type { VideoGamePlatform } from "../../../src/scanner/domain/valueobject/VideoGamePlatform.ts";
import type { RelationRepository } from "../../../src/scanner/repository/RelationRepository.ts";

export class MockRelationRepository implements RelationRepository {
  saveVideoGameRelation(
    _1: VideoGame,
    _2: VideoGameScreenshot,
    _3: VideoGamePlatform,
  ): Promise<void> {
    return Promise.resolve();
  }

  getAllRelations(): Promise<VideoGameRelationImageRepositoryEntity[]> {
    return Promise.resolve([]);
  }
}
