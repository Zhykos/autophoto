import { BlobRef } from "@atproto/api";
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";

export class BlueskyServer {
  private server: Deno.HttpServer<Deno.NetAddr>;

  constructor(port: number) {
    this.server = Deno.serve({ port }, async (_req) => {
      if (_req.url.endsWith("/com.atproto.server.createSession")) {
        return this.createSessionResponse();
      }

      if (_req.url.endsWith("/com.atproto.repo.uploadBlob")) {
        return await this.uploadBlobResponse();
      }

      if (_req.url.endsWith("/com.atproto.repo.createRecord")) {
        return await this.createRecordResponse();
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
    const hash = await sha256.digest(new Uint8Array([1, 2, 3, 4, 5]));
    const body: string = JSON.stringify({
      blob: new BlobRef(CID.create(0, 112, hash), "", 0),
    });
    return this.createResponse(body);
  }

  private async createRecordResponse(): Promise<Response> {
    console.log("/com.atproto.repo.createRecord");
    const hash = await sha256.digest(new Uint8Array([1, 2, 3, 4, 5]));
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
