import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { DomainError } from "../../../../src/common/domain/DomainError.ts";
import { Directory } from "../../../../src/common/domain/valueobject/Directory.ts";
import { File } from "../../../../src/common/domain/valueobject/File.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { Image } from "../../../../src/scanner/domain/valueobject/Image.ts";

Deno.test(function noWEBP() {
  const error = assertThrows(
    () =>
      new Image(
        new Directory(new Path("src")),
        new File(new Path("README.md")),
      ),
  );

  assert(error instanceof DomainError);
  assertEquals(error.message, '"md" is not a valid WEBP image extension');
});

Deno.test(function notEquals() {
  assertFalse(
    new Image(
      new Directory(new Path("src")),
      new File(
        new Path(
          "test/resources/video-game/8-Bit Bayonetta (2015)/PC/8-Bit Bayonetta - 00001.webp",
        ),
      ),
    ).equals("foo"),
  );
});
