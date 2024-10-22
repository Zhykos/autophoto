import { assertEquals } from "@std/assert";
import { KvDriver } from "../../../src/common/dbdriver/KvDriver.ts";

Deno.test(async function getNoObject() {
  const driver = new KvDriver("./test/it-database.sqlite3");
  try {
    const get = await driver.get(["foo"], {});
    assertEquals(get, undefined);
  } finally {
    driver.close();
  }
});
