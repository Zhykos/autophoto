import { assert } from "@std/assert";

export const assertContainsMatch = (
  array: string[],
  matchToTest: RegExp,
): void => {
  const found: string | undefined = array.find((elem) =>
    elem.match(matchToTest),
  );

  assert(
    found !== undefined,
    `Expected to find a match for ${matchToTest} in ${array}`,
  );
};
