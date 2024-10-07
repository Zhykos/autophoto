import { Entity } from "../../../common/domain/Entity.ts";

export class VideoGame extends Entity {
  public constructor(
    uuid: string,
    public readonly title: string,
    public readonly releaseYear: number,
  ) {
    super(uuid);
  }
}
