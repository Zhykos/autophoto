export abstract class CommonKvAccessor {
  private kv: Deno.Kv | undefined = undefined;

  constructor(private readonly databaseFilePath: string) {}

  abstract close(): void;

  async getKv(): Promise<Deno.Kv> {
    if (this.kv === undefined) {
      this.kv = await Deno.openKv(this.databaseFilePath);
    }
    return this.kv;
  }
}
