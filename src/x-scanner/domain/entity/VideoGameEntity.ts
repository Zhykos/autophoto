import { Entity } from "../../../common/domain/Entity.ts";
import type { VideoGame } from "../../../library/domain/valueobject/VideoGame.ts";

export class VideoGameEntity extends Entity {
  public constructor(public readonly videoGame: VideoGame) {
    super();
  }
}
