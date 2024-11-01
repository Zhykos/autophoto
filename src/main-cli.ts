import { main } from "./main.ts";

Deno.exit((await main(Deno.args)) ? 0 : 1);
