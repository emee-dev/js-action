import { waddler } from "waddler";
import fs from "node:fs/promises";
import path from "node:path";

export type Schema = {
  id: number;
  file_path: string;
  file_content: string;
  _schema: string;
};

export default class DB<T extends Schema> {
  private static instance: DB<Schema>;
  collection_name: string;
  private sql: ReturnType<typeof waddler>;
  constructor() {
    this.useMemoryDB();

    if (!DB.instance) {
      DB.instance = this;

      // @ts-expect-error
      return DB.instance;
    }

    // @ts-expect-error
    return DB.instance;
  }

  private useMemoryDB() {
    // @ts-expect-error
    this.sql = waddler({ dbUrl: ":memory:" });
  }

  static async useLocalDB(collection: string) {
    const cwd = process.cwd();

    // const collection_folder = `${cwd}/${collection}`;
    const collection_folder = path.resolve(cwd, collection);
    const schema_folder = `${collection_folder}/__schema__`;

    if (!(await this.instance.doesDirExist(collection_folder))) {
      console.error("Snapshot folder not found.");
      return;
    }

    // @ts-expect-error
    this.instance.sql = waddler({
      dbUrl: `${schema_folder}/schema.db`,
      min: 1,
      max: 1,
    });
  }

  private async doesDirExist(path: string) {
    try {
      let ops = await fs.stat(path);

      if (!ops.isDirectory()) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async createTable() {
    const sql = this.sql;

    if (!sql) {
      return console.log("DB could not be initialized.");
    }

    // Create table
    await sql<Schema>`
      CREATE TABLE items (
        id INTEGER,
        file_path VARCHAR PRIMARY KEY,
        file_content TEXT,
        _schema: TEXT,
      );
    `;
  }

  async dropTable() {
    const sql = this.sql;

    if (!sql) {
      console.log("DB could not be initialized.");
      return;
    }

    // Dropping a table
    await sql`DROP TABLE IF EXISTS items;`;
  }

  async getAllFiles() {
    const sql = this.sql;

    if (!sql) {
      console.log("DB could not be initialized.");
      return;
    }

    const data = await sql<Schema>`SELECT * From items`;

    return data;
  }

  async insertMany(args: T[]) {
    const sql = this.sql;

    if (!sql) {
      console.log("DB could not be initialized.");
      return;
    }

    await sql<void>`
    INSERT INTO items (id, file_path, file_content, _schema) VALUES ${sql.values(
      args.map((item) => [
        item.id,
        item.file_path,
        item.file_content,
        item._schema,
      ])
    )}
  `;
  }

  async updateOne() {
    const sql = this.sql;

    if (!sql) {
      console.log("DB could not be initialized.");
      return;
    }

    // Updating
    const updatedItem: Schema = {
      id: 1,
      file_path: "Updated Item 1",
      file_content: "Updated Description 1",
      _schema: "",
    };

    let update = await sql`
    UPDATE items
    SET file_content = ${updatedItem.file_content}, _schema = ${updatedItem._schema}
    WHERE file_path = ${updatedItem.file_path};
  `;

    console.log("update", update);
  }

  async findOneByPath(filePath: string): Promise<T[]> {
    const sql = this.sql;

    if (!sql) {
      console.log("DB could not be initialized.");
      return;
    }

    // Query by Id
    // TODO make the query return a single document.
    const record =
      await sql<T>`SELECT * FROM items WHERE file_path = ${filePath};`;

    return record;
  }
}

// /**
//  * No change detected, restoring from snapshot.
//  *
//  * Updating the Pull request.
//  *
//  * View the report below.
//  *
//  * If you found value. Please donate here.
//  */

// /**
//  * Pull request contains collection changes. Leaving it unmodified.
//  *
//  * Updating the Pull request.
//  *
//  * View the report below for potential modifications.
//  *
//  * If you found value. Please donate here.
//  */
