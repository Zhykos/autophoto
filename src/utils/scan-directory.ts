export function scanDirectory(
  directory: string,
  pattern: RegExp,
  onFile: (filepath: string) => void,
): void {
  for (const dirEntry of Deno.readDirSync(directory)) {
    if (dirEntry.isDirectory && dirEntry.name !== "@eaDir") {
      scanDirectory(`${directory}/${dirEntry.name}`, pattern, onFile);
    } else if (dirEntry.isFile && dirEntry.name !== ".DS_Store") {
      const fullPath = `${directory}/${dirEntry.name}`;
      if (pattern.test(fullPath)) {
        onFile(fullPath);
      }
    }
  }
}
