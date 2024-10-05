import { Entity } from "../../../common/domain/Entity.ts";

export class UnpublishedVideoGameScreenshotRelation extends Entity {
  constructor(
    public readonly uuid: string,
    public readonly imageID: string,
    public readonly videoGameID: string,
  ) {
    super(uuid);
  }
}
