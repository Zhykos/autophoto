import { Library } from "../../domain/aggregate/Library.ts";
import type { DataAccessor } from "../DataAccessor.ts";

export class KvAccessor implements DataAccessor {
  private kv: Deno.Kv;

  async getKv(): Promise<Deno.Kv> {
    if (this.kv === undefined) {
      this.kv = await Deno.openKv("./db.autophoto.sqlite3");
    }
    return this.kv;
  }

  async loadLibrary(): Promise<Library> {
    const library: Deno.KvEntryMaybe = await (
      await this.getKv()
    ).get(["library"]);

    if (library.value === null) {
      console.log("Library not found, creating new one");
      return new Library();
    }

    return JSON.parse(library.value);
  }

  async saveLibrary(library: Library): Promise<void> {
    await (await this.getKv()).put(["library"], JSON.stringify(library));
  }
}
