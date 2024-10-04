import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { VideoGame } from "../domain/entity/VideoGame.ts";
import type { VideoGameScreenshot } from "../domain/entity/VideoGameScreenshot.ts";
import type { VideoGamePlatform } from "../domain/valueobject/VideoGamePlatform.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./entity/VideoGameRelationImageRepositoryEntity.ts";

export interface RelationRepository {
  saveVideoGameRelation(
    videoGame: VideoGame,
    screenshot: VideoGameScreenshot,
    platform: VideoGamePlatform,
  ): Promise<void>;
}

export class KvRelationRepository implements RelationRepository {
  constructor(private readonly kvDriver: KvDriver) {}

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
    } satisfies VideoGameRelationImageRepositoryEntity;

    await this.kvDriver.save(["relation", entity.uuid], entity);
  }
}
