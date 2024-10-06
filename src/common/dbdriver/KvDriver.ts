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
    const result: T[] = [];
    const kv: Deno.Kv = await this.getKv();
    const entries = kv.list({ prefix: keys });
    for await (const entry of entries) {
      const encoder = new TextDecoder();
      const fileData = encoder.decode(entry.value as BufferSource);
      result.push(JSON.parse(fileData) as T);
    }
    return result;
  }

  public async get<T>(keys: string[], _: T): Promise<T | undefined> {
    const kv: Deno.Kv = await this.getKv();
    const data = await kv.get(keys);
    if (data === undefined) {
      return undefined;
    }

    const encoder = new TextDecoder();
    const fileData = encoder.decode(data.value as BufferSource);
    return JSON.parse(fileData) as T;
  }

  public close(): void {
    if (this.kvSingleton) {
      this.kvSingleton.close();
    }
  }
}
