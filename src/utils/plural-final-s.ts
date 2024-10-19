export const pluralFinalS = (count: number, str: string): string => {
  return `${count} ${str}${count > 1 ? "s" : ""}`;
};
