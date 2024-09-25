export abstract class CommonKvAccessor {
  private kv: Deno.Kv;

  async getKv(): Promise<Deno.Kv> {
    if (this.kv === undefined) {
      this.kv = await Deno.openKv("./db.autophoto.sqlite3");
    }
    return this.kv;
  }
}
