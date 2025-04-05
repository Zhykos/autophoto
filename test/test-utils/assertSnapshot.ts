import { fail } from "@std/assert";
import { equal } from "@std/assert/equal";
import { pathExists } from "../../src/utils/file.ts";

export const assertSnapshot = (
  actualByteArray: Uint8Array,
  referencePathExpectation: string,
): void => {
  if (pathExists(referencePathExpectation)) {
    const expectedByteArray: Uint8Array = Deno.readFileSync(
      referencePathExpectation,
    );

    if (!equal(actualByteArray, expectedByteArray)) {
      const actualFilePath = `${referencePathExpectation}.actual.png`;
      Deno.writeFileSync(actualFilePath, actualByteArray);
      fail(`Difference with the reference, creates "${actualFilePath}".`);
    }
  } else {
    const actualFilePath = `${referencePathExpectation}.actual.png`;
    Deno.writeFileSync(actualFilePath, actualByteArray);
    fail(`No reference file found, creates "${actualFilePath}".`);
  }
};
