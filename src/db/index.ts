import { waddler } from "waddler";
import fs from "node:fs/promises";
// import fs from "node:fs";

// const sql = waddler({ dbUrl: "./__snapshot__/data.duckdb", min: 1, max: 1 });

// const result = await sql`select * from users where id = ${10}`;
// const result = await sql`select * from store`;

// console.log("result", result);

// insert
// const values = sql.values([
// 	["Dan", "dan@acme.com", 25],
// 	["Oleksii", "oleksii@acme.com", 22]
// ]);
// await sql`insert into "users" ("name", "email", "age") values ${values}`;

// better
// const table = sql.identifier("users")
// const columns = sql.identifier(["id", "name", "age"]);
// const values = sql.values([
//   [sql.default, "Oleksii", 20],
//   [sql.default, "Alex", 23],
// ]);

// await sql`insert into ${table} (${columns}) values ${values} returning ${columns};`;

// read
// const result = await sql`select * from users where id = ${10}`;

type Schema = {
  id: number;
  file_path: string;
  file_content: string;
};

export default class DB<T extends Schema> {
  private static instance: DB<Schema>;
  collection_name: string;
  private sql: ReturnType<typeof waddler>;
  constructor() {
    // TODO store db inside collection folder.

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

  static async useLocalDB() {
    const cwd = process.cwd();

    const collection_folder = `${cwd}/collections`;
    const schema_folder = `${collection_folder}/__schema__`;

    if (!(await this.instance.doesDirExist(collection_folder))) {
      console.error("Snapshot folder not found.");
      return;
    }

    // @ts-expect-error
    this.instance.sql = waddler({
      //   dbUrl: "./__snapshot__/schema.db",
      dbUrl: `${schema_folder}/schema.db`,
      min: 1,
      max: 1,
    });
  }

  async doesDirExist(path: string) {
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
    // await sql`
    //   CREATE TABLE items (
    //     id INTEGER PRIMARY KEY,
    //     name VARCHAR,
    //     description TEXT,
    //     price DECIMAL
    //   );
    // `;
    await sql<Schema>`
      CREATE TABLE items (
        id INTEGER,
        file_path VARCHAR PRIMARY KEY,
        file_content TEXT
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

    // Insert multiple items
    // const args = [
    //   { id: 1, file_path: "file_path 1", file_content: "file_content 1" },
    //   { id: 2, file_path: "file_path 2", file_content: "file_content 2" },
    //   { id: 3, file_path: "file_path 3", file_content: "file_content 3" },
    // ];
    // const items = Array(100_000)
    //   .fill(null)
    //   .map((i, idx) => {
    //     return {
    //       id: idx,
    //       name: `Item ${idx}`,
    //       description: `Description ${idx}`,
    //       price: 9.99,
    //     };
    //   });

    await sql<void>`
    INSERT INTO items (id, file_path, file_content) VALUES ${sql.values(
      args.map((item) => [item.id, item.file_path, item.file_content])
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
    const updatedItem = {
      id: 1,
      name: "Updated Item 1",
      description: "Updated Description 1",
      price: 14.99,
    };

    let update = await sql`
    UPDATE items
    SET name = ${updatedItem.name}, description = ${updatedItem.description}, price = ${updatedItem.price}
    WHERE id = ${updatedItem.id};
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
    // const itemId = 1;
    // const filePath = "file_path 1";

    // const item = await sql<{
    //   id: number;
    //   name: string;
    //   description: string;
    //   price: number;
    // }>`SELECT * FROM items WHERE id = ${filePath};`;

    // TODO make the query return a single document.
    const record =
      await sql<T>`SELECT * FROM items WHERE file_path = ${filePath};`;

    // console.log("findOne", record);

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
