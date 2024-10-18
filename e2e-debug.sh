deno run --allow-read --allow-write --unstable-kv src/main.ts config.yml --scan --database=./test/e2e-debug.sqlite3

deno run --allow-read --allow-write --unstable-kv src/main.ts ./test/resources/config2.yml --scan --database=./test/e2e-debug.sqlite3

deno run --allow-read --allow-write --allow-net --unstable-kv src/main.ts --publish --bluesky_login="<>" --bluesky_password="<>" config.yml
