import * as core from "@actions/core";
import github from "@actions/github";
import fs from "node:fs/promises";
import path from "path";

const files = new Map<string, string>();

const isFile = async (filePath: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
};

const readBruFile = async (folder: string): Promise<Map<string, string>> => {
  try {
    const items = await fs.readdir(folder);

    for (const item of items) {
      const itemPath = path.resolve(folder, item);

      if (await isFile(itemPath)) {
        if (files.has(itemPath)) {
          console.log(`File "${itemPath}" already exists.`);
          continue;
        }

        // Normalize filename and store content
        const key = itemPath.replace(/\s/g, "_").toLowerCase();
        files.set(key, await fs.readFile(itemPath, "utf-8"));
      } else {
        await readBruFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error reading folder: ${folder}`, error);
  }

  return files;
};

async function main() {
  try {
    // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput("who-to-greet");
    // console.log(`Hello ${nameToGreet}!`);

    // const time = new Date().toTimeString();
    // core.setOutput("time", time);

    const result = await readBruFile("./collections/");
    console.log("Processed files:", result);

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
