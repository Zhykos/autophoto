import { assert, assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { UnpublishedVideoGamesScreenshot } from "../../../../src/picker/domain/aggregate/UnpublishedVideoGamesScreenshot.ts";
import { UnpublishedVideoGameScreenshotRelation } from "../../../../src/picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";

describe("UnpublishedVideoGamesScreenshot", () => {
  it("should throw an error when video game is missing", () => {
    const relations: UnpublishedVideoGameScreenshotRelation[] = [
      new UnpublishedVideoGameScreenshotRelation("1", "2", "3", "4"),
    ];

    const error = assertThrows(() =>
      UnpublishedVideoGamesScreenshot.buildAll(relations, [], []),
    );
    assert(error instanceof Error);
    assertEquals(error.message, "Missing video game or image for relation: 1");
  });
});
