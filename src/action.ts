import * as core from "@actions/core";
import github from "@actions/github";
import fs from "node:fs/promises";
import path from "path";

// We assume the base path to be the collection folder.
const getBasePath = (dir: string) => `/${path.basename(dir)}`;

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
 *
 * @param collection_item
 * @param base_path
 * @returns
 *
 * Makes the file names unique across environments, by striping the machine specific directories
 * and returning the relative file path under the collection folder.
 *
 * eg
 *
 * "C:\Users\DELL\Desktop\js-action\collections\Private API\drop database.bru"
 *
 * becomes
 * ./collections/Private API/drop database.bru
 */
const standardizePath = (collection_item: string, base_path: string) =>
  `.${base_path}` + collection_item.split(base_path)[1];

async function main() {
  try {
    const ROOT_DIR = path.resolve("./collections");
    const base_path = getBasePath(ROOT_DIR);
    const result = await readFilesRecursively(ROOT_DIR);

    // console.log("Processed files:", result.keys());
    // console.log("ROOT_DIR:");

    [...result.keys()].map((item) =>
      console.log(standardizePath(item, base_path))
    );

    let a = path.resolve("./collections/Private API/drop database.bru");
    console.log("ROOT_DIR:", a);

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
