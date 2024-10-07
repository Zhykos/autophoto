import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../../common/repository/CommonKvRelationRepository.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { VideoGame } from "../domain/entity/VideoGame.ts";
import type { VideoGameScreenshot } from "../domain/entity/VideoGameScreenshot.ts";
import type { VideoGamePlatform } from "../domain/valueobject/VideoGamePlatform.ts";

export interface RelationRepository {
  saveVideoGameRelation(
    videoGame: VideoGame,
    screenshot: VideoGameScreenshot,
    platform: VideoGamePlatform,
  ): Promise<void>;
}

export class KvRelationRepository implements RelationRepository {
  private readonly commonRepository: CommonKvRelationRepository;

  constructor(kvDriver: KvDriver) {
    this.commonRepository = new CommonKvRelationRepository(kvDriver);
  }

  async saveVideoGameRelation(
    videoGame: VideoGame,
    screenshot: VideoGameScreenshot,
    platform: VideoGamePlatform,
  ): Promise<void> {
    const entity = {
      uuid: crypto.randomUUID(),
      videoGameID: videoGame.id,
      platform: platform.value,
      imageID: screenshot.id,
      published: false,
    } satisfies VideoGameRelationImageRepositoryEntity;

    await this.commonRepository.saveVideoGameRelation(entity);
  }
}
