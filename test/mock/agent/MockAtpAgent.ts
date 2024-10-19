import { AtpAgent, type ComAtprotoServerCreateSession } from "@atproto/api";

export class MockAtpAgent extends AtpAgent {
  constructor(private readonly loginSuccess: boolean = true) {
    super({
      service: "https://bsky.social",
    });
  }

  override login(_: {
    identifier: string;
    password: string;
  }): Promise<ComAtprotoServerCreateSession.Response> {
    return Promise.resolve({
      success: this.loginSuccess,
      headers: {},
      data: {
        accessJwt: "",
        refreshJwt: "",
        handle: "",
        did: "",
      },
    });
  }
}
