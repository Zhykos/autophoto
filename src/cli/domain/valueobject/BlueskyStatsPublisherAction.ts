import { AbstractBlueskyPublisherAction } from "./AbstractBlueskyPublisherAction.ts";

export class BlueskyStatsPublisherAction extends AbstractBlueskyPublisherAction {
  override equals(other: unknown): boolean {
    if (other instanceof BlueskyStatsPublisherAction) {
      return super.equals(other);
    }
    return false;
  }
}
