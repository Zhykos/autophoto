import { CID } from "multiformats/cid";
import { createFakeBlobRef } from "../../test-utils/createFakeBlobRef.ts";
import { createFakeHashDigest } from "../../test-utils/createFakeHashDigest.ts";

export class MockBlueskyServer {
  private server: Deno.HttpServer<Deno.NetAddr>;

  public readonly host: string;
  public lastRecord?: BlueskyRecord;

  constructor(port: number) {
    this.host = `http://localhost:${port}`;

    this.server = Deno.serve({ port }, async (_req: Request) => {
      try {
        if (_req.url.endsWith("/com.atproto.server.createSession")) {
          return this.createSessionResponse();
        }

        if (_req.url.endsWith("/com.atproto.repo.uploadBlob")) {
          return await this.uploadBlobResponse();
        }

        if (_req.url.endsWith("/com.atproto.repo.createRecord")) {
          return await this.createRecordResponse(_req);
        }

        console.error(`URL not found: ${_req.url}`);

        return new Response(`URL not found: ${_req.url}`, {
          status: 404,
        });
      } catch (e) {
        console.error("Error on MockBlueskyServer");
        console.error(e);

        return new Response(`Error on MockBlueskyServer: ${e}`, {
          status: 500,
        });
      }
    });
  }

  reset(): void {
    this.lastRecord = undefined;
  }

  async stop(): Promise<void> {
    await this.server.shutdown();

    // XXX That's crap but it's the only way to wait for the server to stop and prevent "broken pipe" errors
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return this.server.finished;
  }

  private createSessionResponse() {
    console.log("/com.atproto.server.createSession");
    const body: string = JSON.stringify({
      accessJwt: "JWT",
      refreshJwt: "",
      handle: "test.bsky.social",
      did: "did:plc:12345678abcdefghijklmnop",
    });
    return this.createResponse(body);
  }

  private async uploadBlobResponse(): Promise<Response> {
    console.log("/com.atproto.repo.uploadBlob");
    const body: string = JSON.stringify({
      blob: await createFakeBlobRef(),
    });
    return this.createResponse(body);
  }

  private async createRecordResponse(req: Request): Promise<Response> {
    console.log("/com.atproto.repo.createRecord");
    this.lastRecord = (await req.json()).record;

    const hash = await createFakeHashDigest();
    const body: string = JSON.stringify({
      uri: "at://did:zhykos:1",
      cid: CID.create(0, 112, hash).toString(),
    });
    return this.createResponse(body);
  }

  private createResponse(body: string): Response {
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  }
}

export type BlueskyRecord = {
  text: string;
  embed: BlueskyRecordEmbed;
  createdAt: string;
};

type BlueskyRecordEmbed = {
  images: BlueskyRecordEmbedImage[];
};

type BlueskyRecordEmbedImage = {
  alt: string;
  image: unknown;
};
