import type { RelationRepository } from "../../../src/common/repository/RelationRepository.ts";
import type { VideoGame } from "../../../src/scanner/domain/entity/VideoGame.ts";
import type { VideoGameScreenshot } from "../../../src/scanner/domain/entity/VideoGameScreenshot.ts";
import type { VideoGamePlatform } from "../../../src/scanner/domain/valueobject/VideoGamePlatform.ts";

export class MockRelationRepository implements RelationRepository {
  saveVideoGameRelation(
    _1: VideoGame,
    _2: VideoGameScreenshot,
    _3: VideoGamePlatform,
  ): Promise<void> {
    return Promise.resolve();
  }
}
