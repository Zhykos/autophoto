import { Entity } from "../../../common/domain/Entity.ts";

export class Image extends Entity {
  constructor(
    uuid: string,
    public readonly path: string,
  ) {
    super(uuid);
  }
}
