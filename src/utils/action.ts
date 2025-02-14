import fs from "node:fs/promises";
import path from "path";

// We assume the base path to be the collection folder.
export const getBasePath = (dir: string) => `/${path.basename(dir)}`;
export const normalPaths = (path: string) => path.replace(/\\/g, "/"); // Ensure Unix-style paths

export const readFilesRecursively = async (
  dir: string,
  fileMap: Map<string, string> = new Map()
): Promise<Map<string, string>> => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.resolve(dir, entry.name);
      const posixPath = fullPath.replace(/\\/g, "/"); // Ensure Unix-style paths

      if (entry.isFile()) {
        fileMap.set(posixPath, await fs.readFile(fullPath, "utf-8"));
      } else if (entry.isDirectory()) {
        await readFilesRecursively(fullPath, fileMap);
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${dir}`, error);
  }

  return fileMap;
};

/**
 * Standardizes file paths by removing machine-specific directories and returning
 * a relative path within the `collections` folder. This ensures consistency across
 * different environments.
 *
 * @param collection_item - The full file path to be standardized.
 * @param base_path - The base directory path to be removed.
 * @returns The relative file path under the `collections` folder.
 *
 * @example
 * // Given:
 * const collection_item = "C:\\Users\\DELL\\Desktop\\js-action\\collections\\Private API\\drop database.bru";
 * const base_path = "C:\\Users\\DELL\\Desktop\\js-action";
 *
 * // Result:
 * "./collections/Private API/drop database.bru"
 */
export const normalizePath = (collection_item: string, base_path: string) =>
  `.${base_path}` + collection_item.split(base_path)[1];
