import { assert, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Directory } from "../../../../src/common/domain/valueobject/Directory.ts";
import { Path } from "../../../../src/common/domain/valueobject/Path.ts";
import { ConfigurationDataPattern } from "../../../../src/configuration/domain/valueobject/ConfigurationDataPattern.ts";
import { ConfigurationScanWithPattern } from "../../../../src/configuration/domain/valueobject/ConfigurationScanWithPattern.ts";
import { DirectoryType } from "../../../../src/configuration/domain/valueobject/DirectoryType.ts";

describe("ConfigurationScanWithPattern", () => {
  it("should be equal when all properties are the same", () => {
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

  it("should not be equal when directories are different", () => {
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

  it("should not be equal when types are different", () => {
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

  it("should not be equal when patterns are different", () => {
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

  it("should not be equal when compared with a non-object", () => {
    const obj = new ConfigurationScanWithPattern(
      new Directory(new Path("src")),
      DirectoryType["video-game"],
      new ConfigurationDataPattern(/a/, ["a"]),
    );
    assertFalse(obj.equals("dir2"));
  });
});
