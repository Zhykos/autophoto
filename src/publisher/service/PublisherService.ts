import type { BlueskyPublication } from "../domain/aggregate/BlueskyPublication.ts";

export interface PublisherService {
  publish(publication: BlueskyPublication): Promise<string | undefined>;
}
