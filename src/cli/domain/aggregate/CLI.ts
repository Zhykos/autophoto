import type { File } from "../../../common/domain/valueobject/File.ts";

export class CLI {
  constructor(
    public readonly configuration: File,
    public readonly databaseFilepath: string | undefined,
    public readonly cron: string | undefined,
  ) {}
}
