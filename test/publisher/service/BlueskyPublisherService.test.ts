import { AtpAgent } from "@atproto/api";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertRejects,
} from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { File } from "../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../src/common/domain/valueobject/Path.ts";
import { BlueskyPublication } from "../../../src/publisher/domain/aggregate/BlueskyPublication.ts";
import { Credentials } from "../../../src/publisher/domain/valueobject/Credentials.ts";
import { Publication } from "../../../src/publisher/domain/valueobject/Publication.ts";
import { BlueskyPublisherService } from "../../../src/publisher/service/BlueskyPublisherService.ts";
import { MockAtpAgent } from "../../mock/agent/MockAtpAgent.ts";
import { MockBlueskyServer } from "../../mock/distant-server/MockBlueskyServer.ts";

describe("BlueskyPublisherService", () => {
  let mockedBlueskyServer: MockBlueskyServer;

  beforeAll(() => {
    mockedBlueskyServer = new MockBlueskyServer(1312);
  });

  afterAll(async () => {
    await mockedBlueskyServer.stop();
  });

  it("should publish", async () => {
    const result: string | undefined =
      await new BlueskyPublisherService().publish(
        new BlueskyPublication(
          new AtpAgent({
            service: mockedBlueskyServer.host,
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
    assertNotEquals(mockedBlueskyServer.lastRecord, undefined);
    assertEquals(mockedBlueskyServer.lastRecord?.text, "message");
    assertEquals(mockedBlueskyServer.lastRecord?.embed.images.length, 1);
    assertEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].alt,
      "Video game screenshot, no more information available.",
    );
    assertNotEquals(
      mockedBlueskyServer.lastRecord?.embed.images[0].image,
      undefined,
    );
  });

  it("should fails during login", async () => {
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
});
