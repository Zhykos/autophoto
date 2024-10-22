import { sha256 } from "multiformats/hashes/sha2";

export const createFakeHashDigest = async () => {
  return await sha256.digest(new Uint8Array([1, 2, 3, 4, 5]));
};
