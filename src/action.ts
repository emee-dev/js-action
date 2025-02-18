import * as core from "@actions/core";
import github from "@actions/github";
import fs from "node:fs/promises";
import { globby } from "globby";
// import path from "path";
import {
  // getBasePath,
  // readFilesRecursively,
  // normalizePath,
  normalPaths,
} from "./utils/action";
import changedFilesInPR from "./demo";
import {
  bruFileToJson,
  brunoDiffableProperties,
  prepareBruFile,
} from "./bruno";
import DB, { Schema } from "./db";
import Diff from "./utils/diff";
// import DB from "./db";
// import { bruFileToJson, jsonToBruFile } from "./bruno";

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

const getBruFiles = async (collection: string) => {
  return await globby([`${collection}/**/*.bru`]);
};

const getOutputfile = async (collection: string) => {
  return await globby([`${collection}/**/*.json`]);
};

async function main() {
  try {
    const db = new DB();
    const collection_path = "./collections";

    if (process.env?.NODE_ENV !== "development") {
      await DB.useLocalDB(collection_path);
    }

    const diff = new Diff();
    const formatted = [] as Schema[];

    // const collection_path =
    //   process.env.NODE_ENV === "development"
    //     ? "./collections"
    //     : core.getInput("collection_path", { required: true });

    const files = await getBruFiles(collection_path);

    let count = 1;
    for (let i of files) {
      let file_path = normalPaths(i);
      let file_content = await fs.readFile(file_path, { encoding: "utf-8" });

      let j = prepareBruFile(bruFileToJson(file_content));

      // console.log("j", j);

      formatted.push({
        id: count++,
        file_path: file_path,
        file_content: file_content,
        _schema: diff.generateSchema(j),
        // _schema: "",
      });
    }

    let output = await getOutputfile(collection_path);

    for (let i of output) {
      let file_path = normalPaths(i);
      let file_content = await fs.readFile(file_path, { encoding: "utf-8" });

      console.log(file_path, file_content);
    }

    // await db.dropTable();

    // await db.createTable();

    // await db.insertMany(formatted);

    // Convert each entry to json
    // changedFilesInPR.forEach((item, key, map) => {
    //   const pr_change = prepareBruFile(bruFileToJson(item));
    //   // console.log("latest:- \n", pr_change);

    //   let db_entry = formatted.find((i) => i.file_path === key);
    //   // console.log("db_entry:- \n", db_entry);

    //   // const snapshot = prepareBruFile(bruFileToJson(db_entry.file_content));

    //   const comparism = diff.compareAgainstSnapshotSchema(
    //     db_entry._schema,
    //     pr_change
    //   );

    //   console.log("diff", comparism);

    //   // map.set(key, latest as any);
    // });

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

    diffRequest();
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

function diffRequest() {
  // brunoDiffableProperties

  let tempSnaphsot = {
    file_path: "",
  };

  let tempLatest = {
    file_path: "",
  };

  // console.log(k.namer);
}
