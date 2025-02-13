import * as core from "@actions/core";
import github from "@actions/github";
import fs from "node:fs/promises";
import path from "path";

// We assume the base path to be the collection folder.
const getBasePath = (dir: string) => `/${path.basename(dir)}`;

const CHANGED_FILES_JSON = "changed_files.json";

const readFilesRecursively = async (
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
const standardizePath = (collection_item: string, base_path: string) =>
  `.${base_path}` + collection_item.split(base_path)[1];

// Function to read the JSON file containing changed files
const getChangedFiles = async (): Promise<string[]> => {
  try {
    const data = await fs.readFile(CHANGED_FILES_JSON, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.changed_files || [];
  } catch (error) {
    core.setFailed(`Failed to read changed files JSON: ${error.message}`);
    return [];
  }
};

async function main() {
  try {
    const collection_path =
      process.env.NODE_ENV === "development"
        ? "./collections"
        : core.getInput("collection_path", { required: true });

    const ROOT_DIR = path.resolve(collection_path);

    const base_path = getBasePath(ROOT_DIR);
    const result = await readFilesRecursively(ROOT_DIR);

    // console.log("Processed files:", result.keys());

    // [...result.keys()].map((item) =>
    //   console.log(standardizePath(item, base_path))
    // );

    const changedFiles = await getChangedFiles();
    if (changedFiles.length === 0) {
      console.log("No changed files detected in ./collections.");
      return;
    }

    console.log("changedFiles", changedFiles);
    // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput("who-to-greet");
    // console.log(`Hello ${nameToGreet}!`);

    // const time = new Date().toTimeString();
    // core.setOutput("time", time);

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
