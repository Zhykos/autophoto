import { fail } from "@std/assert";
import { equal } from "@std/assert/equal";
import { pathExists } from "../../src/utils/file.ts";

export const assertSnapshot = (
  actualByteArray: Uint8Array,
  referencePathExpectation: string,
): void => {
  const refFilePath: string = filename(referencePathExpectation);
  if (pathExists(refFilePath)) {
    const expectedByteArray: Uint8Array = Deno.readFileSync(refFilePath);

    if (!equal(actualByteArray, expectedByteArray)) {
      const actualFilePath: string = filename(
        referencePathExpectation,
        "actual",
      );
      Deno.writeFileSync(actualFilePath, actualByteArray);
      fail(`Difference with the reference, creates "${actualFilePath}".`);
    }
  } else {
    const actualFilePath: string = filename(referencePathExpectation, "actual");
    Deno.writeFileSync(actualFilePath, actualByteArray);
    fail(`No reference file found, creates "${actualFilePath}".`);
  }
};

const filename = (originFilename: string, suffix?: string): string => {
  const split: string[] = originFilename.split(".");
  const extension: string | undefined = split.pop();
  return `${split.join(".")}_${Deno.build.os}_${Deno.build.arch}${
    suffix ? "." + suffix : ""
  }.${extension}`;
};
