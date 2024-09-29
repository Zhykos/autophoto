import { Entity } from "../../../common/domain/Entity.ts";
import type { VideoGame } from "../valueobject/VideoGame.ts";

export class VideoGameEntity extends Entity {
  public constructor(
    uuid: string,
    public readonly videoGame: VideoGame,
  ) {
    super(uuid);
  }
}
