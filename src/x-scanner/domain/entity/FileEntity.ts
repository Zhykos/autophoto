import { Entity } from "../../../common/domain/Entity.ts";
import type { File } from "../valueobject/File.ts";

export class FileEntity extends Entity {
  constructor(
    uuid: string,
    public readonly file: File,
  ) {
    super(uuid);
  }
}
