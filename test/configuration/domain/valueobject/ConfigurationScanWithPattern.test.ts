import { assert, assertFalse } from "jsr:@std/assert";
import { ConfigurationDataPattern } from "../../../../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../../../../src/configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { Directory } from "../../../../src/configuration/domain/valueobject/Directory.ts";
import { DirectoryType } from "../../../../src/configuration/domain/valueobject/DirectoryType.ts";
import { Path } from "../../../../src/configuration/domain/valueobject/Path.ts";

Deno.test(function equals() {
  const obj1 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  const obj2 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  assert(obj1.equals(obj2));
});

Deno.test(function notEqualsSameTypeButDifferentDirectory() {
  const obj1 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  const obj2 = new ConfigurationScanWithPattern(
    new Directory(new Path("test")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  assertFalse(obj1.equals(obj2));
});

Deno.test(function notEqualsSameTypeButDifferentType() {
  const obj1 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  const obj2 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType.unknown,
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  assertFalse(obj1.equals(obj2));
});

Deno.test(function notEqualsSameTypeButDifferentPattern() {
  const obj1 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  const obj2 = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/b/, ["a"]),
  );
  assertFalse(obj1.equals(obj2));
});

Deno.test(function notEquals() {
  const obj = new ConfigurationScanWithPattern(
    new Directory(new Path("src")),
    DirectoryType["video-game"],
    new ConfigurationDataPattern(/a/, ["a"]),
  );
  assertFalse(obj.equals("dir2"));
});
