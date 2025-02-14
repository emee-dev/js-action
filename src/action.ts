import * as core from "@actions/core";
import github from "@actions/github";
import fs from "node:fs/promises";
import path from "path";
import {
  // getBasePath,
  // readFilesRecursively,
  // normalizePath,
  normalPaths,
} from "./utils/action";
import DB from "./db";
import { bruFileToJson, jsonToBruFile } from "./bruno";
// import { glob } from "node:fs/promises";
import { glob } from "node:fs";

/**
 * Action events:
 *
 * 1. Init:- Read all request files and store their schema(s).
 * 2. Pull request:- Grab changed/modified collection request files,
 *    compare their schema against what we have in database. If PR file
 *    contains any structural change, then update the database record for
 *    that particular request. If PR does not contain any schema changes
 *    then restore request from database.
 * 3. New file:- if a collection in PR could not be found in database,
 *    then set it.
 * 4. Deleted file:- If a PR file has a status of "deleted" then remove
 *    from the database.
 * 5. Renamed Collection:- Unload Database files then update their paths.
 *
 * CLI:- 1, 5 could be achieved via a cli interface.
 */

const getBruFiles = (collection: string) => {
  return new Promise<string[]>((resolve, reject) => {
    glob(`${collection}/**/*.bru`, (err, v) => {
      if (err) {
        reject(err);
      }

      resolve(v);
    });
  });
};

const getOutputfile = (collection: string) => {
  return new Promise<string[]>((resolve, reject) => {
    glob(`${collection}/**/*.json`, (err, v) => {
      if (err) {
        reject(err);
      }

      resolve(v);
    });
  });
};

async function main() {
  try {
    // const db = new DB();
    const formatted = [];

    const collection_path =
      process.env.NODE_ENV === "development"
        ? "./collections"
        : core.getInput("collection_path", { required: true });

    // const files = await getBruFiles(collection_path);

    // let count = 1;
    // for (let i of files) {
    //   let file_path = normalPaths(i);
    //   let file_content = await fs.readFile(file_path, { encoding: "utf-8" });

    //   formatted.push({
    //     id: count++,
    //     file_path: `./${file_path}`,
    //     file_content: file_content,
    //   });
    // }

    let output = await getOutputfile(collection_path);

    for (let i of output) {
      let file_path = normalPaths(i);
      let file_content = await fs.readFile(file_path, { encoding: "utf-8" });

      console.log(file_path, file_content);
    }

    // if (process.env?.NODE_ENV !== "development") {
    //   await DB.useLocalDB();
    // }

    // await db.dropTable();

    // await db.createTable();

    // await db.insertMany(formatted);

    // let d = await db.getAllFiles();

    // let findOne = await db.findOneByPath(
    //   "./collections/Private API/drop database.bru"
    // );

    // console.log(
    //   "findOne",
    //   jsonToBruFile({
    //     meta: bruFileToJson(findOne[0].file_content).meta,
    //     // http: bruFileToJson(findOne[0].file_content).http,
    //   })
    // );

    // console.log("length", d.length);
    // console.log("data", d);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

// `who-to-greet` input defined in action metadata file
// const nameToGreet = core.getInput("who-to-greet");
// console.log(`Hello ${nameToGreet}!`);

// const time = new Date().toTimeString();
// core.setOutput("time", time);

// Get the JSON webhook payload for the event that triggered the workflow
// const payload = JSON.stringify(github.context.payload, undefined, 2);
// console.log(`The event payload: ${payload}`);
