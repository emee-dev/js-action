// export type Path = string;
// export type ValidTypes =
//   | "string"
//   | "object"
//   | "number"
//   | "array"
//   | "boolean"
//   | "null"
//   | "UNSUPPORTED_TYPE";

// export const getType = (entity: any): ValidTypes => {
//   if (Array.isArray(entity)) {
//     return "array";
//   } else if (typeof entity === "string") {
//     return "string";
//   } else if (typeof entity === "number") {
//     return "number";
//   } else if (
//     typeof entity === "object" &&
//     !Array.isArray(entity) &&
//     entity !== null
//   ) {
//     return "object";
//   } else if (Boolean(entity) && typeof entity !== "function") {
//     return "boolean";
//   } else {
//     return entity === null ? "null" : "UNSUPPORTED_TYPE";
//   }
// };

// // const sturtural = new Map<Path, ValidTypes>();

// /**
//  *
//  * @param bru_file
//  * @param keys
//  * @param key_path
//  * @param map
//  * @returns
//  *
//  * It returns a `[keys, map]` containing all the keys of the object, and
//  * map containing the keys and their types.
//  *
//  */
// export const getObjectStructure = (
//   bru_file: Record<string, any>,
//   keys: string[] = [],
//   key_path = "",
//   map = new Map<Path, ValidTypes>()
// ) => {
//   if (!bru_file) {
//     return [keys, map] as const;
//   }

//   let node = Object.entries(bru_file);

//   // Works for arrays too, though it could probably use some refinement.
//   if (node.length > 0 && typeof bru_file === "object") {
//     for (const [key, value] of node) {
//       let child = bru_file[key];
//       let location = key_path + "." + key;

//       // TODO improve the handling of array values.
//       if (Array.isArray(value)) {
//         // console.log("value", key);
//       }

//       map.set(location, getType(value));

//       keys.push(location);
//       getObjectStructure(child, keys, location, map);
//     }
//   }

//   const stripLeadingDot = keys.map((item) => item.replace(".", ""));
//   return [stripLeadingDot, map] as const;
// };

// /**
//  *
//  * @param old_obj
//  * @param latest_obj
//  *
//  * Compares the structure of two objects for equality.
//  * eg two header objects can be compared to make sure it
//  * has the same num of properties and the typeof values are the same.
//  */
// // TODO generate a detail report of changes. Add a flag to fail fast or continue checking.
// export const compareRequests = (
//   snapshot: Record<string, unknown>,
//   pr_change: Record<string, unknown>
// ) => {
//   const [keys, map] = getObjectStructure(snapshot, [], "");
//   const [keys2, map2] = getObjectStructure(pr_change, [], "");

//   // Compare number of keys
//   const isSameSize = map.size === map2.size ? true : false;

//   // Compare entity paths
//   const isSameKeys = JSON.stringify(keys) === JSON.stringify(keys2);

//   // Compare typeof values
//   let isSameTypes = false;
//   for (let [key, type_of_key] of map.entries()) {
//     let type_of_key2 = map2.get(key);

//     if (type_of_key !== type_of_key2) {
//       isSameTypes = false;
//       break;
//     } else {
//       isSameTypes = true;
//     }
//   }

//   return {
//     isSameSize,
//     isSameKeys,
//     isSameTypes,
//   };
// };

import {
  z,
  ZodArray,
  ZodObject,
  ZodRawShape,
  ZodSchema,
  ZodTypeAny,
} from "zod";
import { jsonToZod } from "json-to-zod";
import { fromError } from "zod-validation-error";

class Diff {
  generateSchema(args: Record<string, unknown>) {
    if (typeof args !== "object") {
      return null;
    }

    const schemaStr = jsonToZod(args);

    return schemaStr;
  }

  compareAgainstSnapshotSchema(
    schemaStr: string,
    args: Record<string, unknown>
  ) {
    //     let schemaStr = `
    //     const schema = z.object({
    //   firstName: z.string(),
    //   lastName: z.string(),
    //   school: z.object({ name: z.string(), type: z.string() }),
    //   hobbies: z.array(z.object({ name: z.string() })),
    //   programs: z.array(
    //     z.object({ name: z.string(), sub_folder: z.object({ name: z.string() }) })
    //   ),
    // });
    //     `;

    const generateSchema = new Function("z", `${schemaStr}; return schema;`);
    const schema: z.ZodObject<z.ZodRawShape> = this.applyStrict(
      generateSchema(z)
    );

    const result = schema.safeParse(args);

    if (!result.success) {
      const validationError = fromError(result.error);
      return {
        hasBeenModified: true,
        reasons: validationError.toString(),
        errors: validationError.details,
      };
    }

    return {
      hasBeenModified: false,
      reasons: null,
      errors: null,
    };
  }

  /**
   *
   * @param schema
   * @returns
   *
   * Recursively applies `.strict()` method on each object of the schema.
   */
  private applyStrict<T extends ZodSchema<any>>(schema: T): T {
    if (schema instanceof ZodObject) {
      const shape = schema._def.shape() as ZodRawShape; // Ensure correct shape extraction
      const newShape: ZodRawShape = Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [
          key,
          this.applyStrict(value as ZodTypeAny),
        ])
      );

      return z.object(newShape).strict() as any;
    } else if (schema instanceof ZodArray) {
      return z.array(this.applyStrict(schema._def.type as ZodTypeAny)) as any;
    }
    return schema;
  }
}

export default Diff;
