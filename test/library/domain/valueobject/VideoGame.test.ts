import {
  assert,
  assertFalse,
  assertMatch,
  assertThrows,
} from "jsr:@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { VideoGame } from "../../../../src/library/domain/valueobject/VideoGame.ts";
import { VideoGameReleaseYear } from "../../../../src/library/domain/valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../../../../src/library/domain/valueobject/VideoGameTitle.ts";

Deno.test(function notEquals() {
  const obj = new VideoGame(
    new VideoGameTitle("title"),
    new VideoGameReleaseYear(2000),
  );
  assertFalse(obj.equals("foo"));
});

Deno.test(function builderNoTitle() {
  const error = assertThrows(() =>
    VideoGame.builder().withReleaseYear(2000).build(),
  ) as Error;

  assertMatch(
    error.message,
    /Title \(undefined\) and release year \(2000\) are required/,
  );
  assert(error instanceof DomainError);
});
