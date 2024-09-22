export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await Deno.lstat(path);
    return true;
  } catch (_) {
    return false;
  }
};
