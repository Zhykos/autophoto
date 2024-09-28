import { Entity } from "../../../common/domain/Entity.ts";
import type { VideoGamePlatform } from "../valueobject/VideoGamePlatform.ts";
import type { FileEntity } from "./FileEntity.ts";
import type { VideoGameEntity } from "./VideoGameEntity.ts";

export class VideoGameFileLinkEntity extends Entity {
  constructor(
    public readonly videoGameEntity: VideoGameEntity,
    public readonly platform: VideoGamePlatform,
    public readonly filesEntities: FileEntity[],
  ) {
    super();
  }

  addFile(file: FileEntity): void {
    this.filesEntities.push(file);
  }
}