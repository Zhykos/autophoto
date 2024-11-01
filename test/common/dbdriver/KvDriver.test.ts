import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";

describe("KvDriver", () => {
  it("should return undefined for non-existent object", async () => {
    const driver = new KvDriver("./test/it-database.sqlite3");
    try {
      const get = await driver.get(["foo"], {});
      assertEquals(get, undefined);
    } finally {
      driver.close();
    }
  });
});
