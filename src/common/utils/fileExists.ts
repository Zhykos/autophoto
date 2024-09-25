const getFileInfo = (path: string): Deno.FileInfo => {
  return Deno.lstatSync(path);
};

export const fileExists = (path: string): boolean => {
  try {
    getFileInfo(path);
    return true;
  } catch (_) {
    return false;
  }
};

export const isFile = (path: string): boolean => {
  try {
    const fileInfo: Deno.FileInfo = getFileInfo(path);
    return fileInfo.isFile;
  } catch (_) {
    return false;
  }
};

export const isDirectory = (path: string): boolean => {
  try {
    const fileInfo: Deno.FileInfo = getFileInfo(path);
    return fileInfo.isDirectory;
  } catch (_) {
    return false;
  }
};
