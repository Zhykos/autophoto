export class KvDriver {
  private kvSingleton: Deno.Kv | undefined = undefined;

  constructor(private readonly databaseFilePath: string) {}

  private async getKv(): Promise<Deno.Kv> {
    if (this.kvSingleton === undefined) {
      this.kvSingleton = await Deno.openKv(this.databaseFilePath);
    }
    return this.kvSingleton;
  }

  public async save(keys: string[], entity: unknown): Promise<void> {
    const encoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(JSON.stringify(entity));
    const kv: Deno.Kv = await this.getKv();
    await kv.set(keys, data);
  }

  public async list<T>(keys: string[], _: T): Promise<T[]> {
    return KvDriver.list(await this.getKv(), keys, _);
  }

  public static async list<T>(kv: Deno.Kv, keys: string[], _: T): Promise<T[]> {
    const result: T[] = [];
    const entries = kv.list({ prefix: keys });
    for await (const entry of entries) {
      const encoder = new TextDecoder();
      const fileData = encoder.decode(entry.value as BufferSource);
      result.push(JSON.parse(fileData) as T);
    }
    return result;
  }

  public close(): void {
    if (this.kvSingleton) {
      this.kvSingleton.close();
    }
  }
}
