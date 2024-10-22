import { assert, assertEquals, assertThrows } from "@std/assert";
import { UnpublishedVideoGamesScreenshot } from "../../../../src/picker/domain/aggregate/UnpublishedVideoGamesScreenshot.ts";
import { UnpublishedVideoGameScreenshotRelation } from "../../../../src/picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";

Deno.test(function missingVideoGame() {
  const relations: UnpublishedVideoGameScreenshotRelation[] = [
    new UnpublishedVideoGameScreenshotRelation("1", "2", "3", "4"),
  ];

  const error = assertThrows(() =>
    UnpublishedVideoGamesScreenshot.buildAll(relations, [], []),
  );
  assert(error instanceof Error);
  assertEquals(error.message, "Missing video game or image for relation: 1");
});
