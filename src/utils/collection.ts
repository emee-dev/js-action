export type Path = string;
export type ValidTypes =
  | "string"
  | "object"
  | "number"
  | "array"
  | "boolean"
  | "null"
  | "UNSUPPORTED_TYPE";

export const getType = (entity: any): ValidTypes => {
  if (Array.isArray(entity)) {
    return "array";
  } else if (typeof entity === "string") {
    return "string";
  } else if (typeof entity === "number") {
    return "number";
  } else if (
    typeof entity === "object" &&
    !Array.isArray(entity) &&
    entity !== null
  ) {
    return "object";
  } else if (Boolean(entity) && typeof entity !== "function") {
    return "boolean";
  } else {
    return entity === null ? "null" : "UNSUPPORTED_TYPE";
  }
};

// const sturtural = new Map<Path, ValidTypes>();

/**
 *
 * @param bru_file
 * @param keys
 * @param key_path
 * @param map
 * @returns
 *
 * It returns a `[keys, map]` containing all the keys of the object, and
 * map containing the keys and their types.
 *
 */
export const getObjectStructure = (
  bru_file: Record<string, any>,
  keys: string[] = [],
  key_path = "",
  map = new Map<Path, ValidTypes>()
) => {
  if (!bru_file) {
    return [keys, map] as const;
  }

  let node = Object.entries(bru_file);

  if (node.length > 0 && typeof bru_file === "object") {
    for (const [key, value] of node) {
      let child = bru_file[key];
      let location = key_path + "." + key;

      map.set(location, getType(value));

      keys.push(location);
      getObjectStructure(child, keys, location, map);
    }
  }

  // return keys.map((item) => item.replace(".", ""));
  return [keys, map] as const;
};

/**
 *
 * @param old_obj
 * @param latest_obj
 *
 * Compares the structure of two objects for equality.
 * eg two header objects can be compared to make sure it
 * has the same num of properties and the typeof values are the same.
 */
// TODO generate a detail report of changes. Add a flag to fail fast or continue checking.
export const compareRequests = (
  old_obj: Record<string, unknown>,
  latest_obj: Record<string, unknown>
) => {
  let [keys, map] = getObjectStructure(old_obj, [], "");
  let [keys2, map2] = getObjectStructure(latest_obj, [], "");

  // Compare number of keys
  let isSameSize = map.size === map2.size ? true : false;
  // console.log("isSameSize", isSameSize);

  // Compare paths
  let isSameKeys = JSON.stringify(keys) === JSON.stringify(keys2);
  // console.log("isSameKeys", isSameKeys);

  // Compare typeof values
  let isSameTypes = false;
  for (let [key, type_of_key] of map.entries()) {
    let type_of_key2 = map2.get(key);

    if (type_of_key !== type_of_key2) {
      isSameTypes = false;
      break;
    } else {
      isSameTypes = true;
    }
  }
  // console.log("isSameTypes", isSameTypes);

  return {
    isSameSize,
    isSameKeys,
    isSameTypes,
  };
};
