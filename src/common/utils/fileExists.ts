const getFileInfo = (path: string): Deno.FileInfo | null => {
  try {
    return Deno.lstatSync(path);
  } catch (_) {
    return null;
  }
};

export const fileExists = (path: string): boolean => {
  const fileInfo: Deno.FileInfo | null = getFileInfo(path);
  return fileInfo !== null;
};

export const isFile = (path: string): boolean => {
  const fileInfo: Deno.FileInfo | null = getFileInfo(path);
  return fileInfo?.isFile ?? false;
};

export const isDirectory = (path: string): boolean => {
  const fileInfo: Deno.FileInfo | null = getFileInfo(path);
  return fileInfo?.isDirectory ?? false;
};
