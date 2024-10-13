import { BlobRef } from "@atproto/api";
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";

Deno.serve({ port: 8080 }, (_req) => {
  if (_req.url.endsWith("/com.atproto.server.createSession")) {
    return createSessionResponse();
  }

  if (_req.url.endsWith("/com.atproto.repo.uploadBlob")) {
    return uploadBlobResponse();
  }

  if (_req.url.endsWith("/com.atproto.repo.createRecord")) {
    return createRecordResponse();
  }

  throw new Error(`URL not found: ${_req.url}`);
});

function createSessionResponse() {
  console.log("/com.atproto.server.createSession");
  const body = JSON.stringify({
    accessJwt: "NOT FOUND",
    refreshJwt: "",
    handle: "test.bsky.social",
    did: "did:plc:12345678abcdefghijklmnop",
  });
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

async function uploadBlobResponse() {
  console.log("/com.atproto.repo.uploadBlob");
  const hash = await sha256.digest(new Uint8Array([1, 2, 3, 4, 5]));
  const body = JSON.stringify({
    blob: new BlobRef(CID.create(0, 112, hash), "", 0),
  });
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

async function createRecordResponse() {
  console.log("/com.atproto.repo.createRecord");
  const hash = await sha256.digest(new Uint8Array([1, 2, 3, 4, 5]));
  const body = JSON.stringify({
    uri: "at://did:zhykos:1",
    cid: CID.create(0, 112, hash).toString(),
  });
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
