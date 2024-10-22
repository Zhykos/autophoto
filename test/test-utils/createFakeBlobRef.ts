import { BlobRef } from "@atproto/api";
import { CID } from "multiformats/cid";
import { createFakeHashDigest } from "./createFakeHashDigest.ts";

export const createFakeBlobRef = async (): Promise<BlobRef> => {
  const hash = await createFakeHashDigest();
  return new BlobRef(CID.create(0, 112, hash), "", 0);
};
