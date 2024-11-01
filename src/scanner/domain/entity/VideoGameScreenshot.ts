import { Entity } from "../../../common/domain/Entity.ts";
import type { Image } from "../valueobject/Image.ts";

export class VideoGameScreenshot extends Entity {
  constructor(
    public readonly image: Image,
    uuid?: string,
    public readonly toUpdate = false,
  ) {
    super(uuid);
  }
}
