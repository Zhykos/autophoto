import { AbstractBlueskyPublisherAction } from "./AbstractBlueskyPublisherAction.ts";

export class BlueskyImagesPublisherAction extends AbstractBlueskyPublisherAction {
  override equals(other: unknown): boolean {
    if (other instanceof BlueskyImagesPublisherAction) {
      return super.equals(other);
    }
    return false;
  }
}
