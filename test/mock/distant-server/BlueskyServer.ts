import { CID } from "multiformats/cid";
import { createFakeBlobRef } from "../../test-utils/createFakeBlobRef.ts";
import { createFakeHashDigest } from "../../test-utils/createFakeHashDigest.ts";

export class BlueskyServer {
  private server: Deno.HttpServer<Deno.NetAddr>;

  public lastRecord?: BlueskyRecord;

  constructor(port: number) {
    this.server = Deno.serve({ port }, async (_req: Request) => {
      if (_req.url.endsWith("/com.atproto.server.createSession")) {
        return this.createSessionResponse();
      }

      if (_req.url.endsWith("/com.atproto.repo.uploadBlob")) {
        return await this.uploadBlobResponse();
      }

      if (_req.url.endsWith("/com.atproto.repo.createRecord")) {
        return await this.createRecordResponse(_req);
      }

      throw new Error(`URL not found: ${_req.url}`);
    });
  }

  stop(): Promise<void> {
    return this.server.shutdown();
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
