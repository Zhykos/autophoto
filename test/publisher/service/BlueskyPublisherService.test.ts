import { AtpAgent } from "@atproto/api";
import { assert, assertEquals, assertRejects } from "@std/assert";
import { File } from "../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../src/common/domain/valueobject/Path.ts";
import { BlueskyPublication } from "../../../src/publisher/domain/aggregate/BlueskyPublication.ts";
import { Credentials } from "../../../src/publisher/domain/valueobject/Credentials.ts";
import { Publication } from "../../../src/publisher/domain/valueobject/Publication.ts";
import { BlueskyPublisherService } from "../../../src/publisher/service/BlueskyPublisherService.ts";
import { MockAtpAgent } from "../../mock/agent/MockAtpAgent.ts";
import { BlueskyServer } from "../../mock/distant-server/BlueskyServer.ts";

Deno.test(async function publish() {
  const serverPort = 8099;
  const mockeBlueskyServer = new BlueskyServer(serverPort);

  try {
    const result: string | undefined =
      await new BlueskyPublisherService().publish(
        new BlueskyPublication(
          new AtpAgent({
            service: `http://localhost:${serverPort}`,
          }),
          new Credentials("l", "p"),
          new Publication("message", [
            new File(
              new Path(
                "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
              ),
            ),
          ]),
        ),
      );
    assertEquals(result, "at://did:zhykos:1");
  } finally {
    mockeBlueskyServer.stop();
  }
});

Deno.test(async function loginFailed() {
  const error = await assertRejects(
    async () =>
      await new BlueskyPublisherService().publish(
        new BlueskyPublication(
          new MockAtpAgent(false),
          new Credentials("l", "p"),
          new Publication("message", [
            new File(
              new Path(
                "./test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
              ),
            ),
          ]),
        ),
      ),
  );
  assert(error instanceof Error);
  assertEquals(error.message, "Failed to login!");
});
