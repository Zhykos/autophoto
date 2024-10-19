export const pluralFinalS = (
  count: number,
  str: string,
  displayCount = true,
): string => {
  if (displayCount) {
    return `${count} ${stringWithFinalS(count, str)}`;
  }

  return stringWithFinalS(count, str);
};

const stringWithFinalS = (count: number, str: string): string => {
  return `${str}${count > 1 ? "s" : ""}`;
};
