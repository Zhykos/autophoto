import { main } from "./main";

Deno.exit((await main(Deno.args)) ? 0 : 1);
