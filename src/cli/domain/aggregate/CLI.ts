import type { File } from "../../../common/domain/valueobject/File.ts";

export class CLI {
  constructor(
    public readonly configuration: File,
    public databaseFilepath = "./db.autophoto.sqlite3",
  ) {}
}
