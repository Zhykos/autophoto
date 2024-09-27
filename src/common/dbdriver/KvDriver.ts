export class KvDriver {
  private kvSingleton: Deno.Kv | undefined = undefined;

  constructor(private readonly databaseFilePath: string) {}

  async getKv(): Promise<Deno.Kv> {
    if (this.kvSingleton === undefined) {
      this.kvSingleton = await Deno.openKv(this.databaseFilePath);
    }
    return this.kvSingleton;
  }

  async save(keys: string[], entity: unknown): Promise<void> {
    const kv: Deno.Kv = await this.getKv();
    const encoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(JSON.stringify(entity));
    await kv.set(keys, data);
  }

  close(): void {
    if (this.kvSingleton) {
      this.kvSingleton.close();
    }
  }
}
