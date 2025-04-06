import { AbstractBlueskyPublisherAction } from "./AbstractBlueskyPublisherAction.ts";

export class BlueskyStatsPublisherAction extends AbstractBlueskyPublisherAction {
  constructor(
    host: URL,
    login: string,
    password: string,
    public readonly diagramBrowserExecutorURL?: URL,
  ) {
    super(host, login, password);
  }

  override equals(other: unknown): boolean {
    if (other instanceof BlueskyStatsPublisherAction) {
      return (
        super.equals(other) &&
        this.diagramBrowserExecutorURL === other.diagramBrowserExecutorURL
      );
    }
    return false;
  }
}
