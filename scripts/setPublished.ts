/*
 * Can be used to update the "published" property of a video game.
 * For instance I used it to not publish Hogwarts screenshots because even if two persons see my images, I don't want to make publicity to JKR pétasse. Sorry for the devs who made a great work :(
 */

async function getVideoGame(kv: Deno.Kv, name: string): Promise<string> {
  const gamesEntries = kv.list({ prefix: ["video-game"] });
  for await (const entry of gamesEntries) {
    const decoder = new TextDecoder();
    const fileData: string = decoder.decode(entry.value as BufferSource);
    const json = JSON.parse(fileData);

    if (json.title === name) {
      return json.uuid;
    }
  }

  throw new Error(`Game "${name}" not found.`);
}

async function setPublished(kv: Deno.Kv, gameUUID: string): Promise<void> {
  const entries = kv.list({ prefix: ["relation"] });

  for await (const entry of entries) {
    const decoder = new TextDecoder();
    const fileData: string = decoder.decode(entry.value as BufferSource);
    const json = JSON.parse(fileData);

    if (json.videoGameID === gameUUID) {
      json.published = true;
      //console.log(json);

      const encoder = new TextEncoder();
      const data: Uint8Array = encoder.encode(JSON.stringify(json));
      await kv.set(["relation", json.uuid], data);
    }
  }
}

async function main(videoGameName: string) {
  const kv: Deno.Kv = await Deno.openKv("db.autophoto.sqlite3");
  try {
    const gameUUID: string = await getVideoGame(kv, videoGameName);
    await setPublished(kv, gameUUID);
  } finally {
    kv.close();
  }
}

main("Hogwarts Legacy");
