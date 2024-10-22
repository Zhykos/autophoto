import type { AtpAgent } from "@atproto/api";
import type { Credentials } from "../valueobject/Credentials.ts";
import type { Publication } from "../valueobject/Publication.ts";

export class BlueskyPublication {
  constructor(
    public readonly agent: AtpAgent,
    public readonly credentials: Credentials,
    public readonly publication: Publication,
  ) {}
}
