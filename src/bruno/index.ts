import BruToJson from "@usebruno/lang/v2/src/bruToJson";
import JsonToBru from "@usebruno/lang/v2/src/jsonToBru";

// These are the properties that can be converted into an object.
// Since Git can not tell when its schema changed, unlike text.
export const brunoDiffableProperties = [
  "query",
  "headers",
  // TODO handle the supported request bodies properly.
  "body:json",
  "body:formUrlEncoded",
  "body:multipartForm",
] as const;

const queryToObj = (entry: BruFile["params"]) => {
  let query_params = entry.filter(
    (i) => i.type === "query" && i.enabled === true
  );
  let obj = {} as Record<string, string>;

  for (let i of query_params) {
    obj[i.name] = i.value;
  }

  return obj;
};

const headersToObj = (headers: BruFile["headers"]) => {
  let obj = {} as Record<string, string>;

  for (let i of headers) {
    if (i.enabled) {
      obj[i.name] = i.value;
    }
  }

  return obj;
};

type QueryParams = {
  name: string;
  value: string;
  enabled: boolean;
  type: "query";
};
type Headers = { name: string; value: string; enabled: boolean };
type Assertions = { name: string; value: string; enabled: boolean };
type formUrlEncoded = { name: string; value: string; enabled: boolean };
type multipartForm = {
  name: string;
  value: string | string[];
  enabled: boolean;
  type: "text" | "file";
  contentType: string;
};

type BodyTypes = {
  json: string;
  text: string;
  xml: string;
  formUrlEncoded: formUrlEncoded[];
  multipartForm: multipartForm[];
};

interface BruFile {
  meta: { name: string; type: "http"; seq: `${number}` };
  http: {
    method: string;
    url: string;
    body: "json" | "formUrlEncoded" | "multipartForm" | "text" | "xml";
    auth: string;
  };
  // aka query
  params: QueryParams[];
  headers: Headers[];
  body: BodyTypes;
  assertions: Assertions[];
  script: {
    req: string;
    res: string;
  };
  docs: string;
}

// Note: bruno does not validate the json body, so an invalid json could be saved to file.
// Make sure our script is fault tolerant.
const isValidJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

export const bruFileToJson = (request: string): BruFile => BruToJson(request);
export const jsonToBruFile = (request: Partial<BruFile>): string =>
  JsonToBru(request);

type BrunoDiffableProperties = typeof brunoDiffableProperties;
type Property = BrunoDiffableProperties[number];
type PreparedBruFile = Record<Property, Record<string, string>>;

/**
 * Parses a brufile and extracts the fields that will definitely be sent
 * to the target server. It also gets rid of Bruno specific constraints or properties.
 *
 * @param entry
 * @returns
 *
 */
// TODO imrpve this function to use a single loop.
export const prepareBruFile = (entry: BruFile) => {
  let temp = {};

  // Build an object with all the properties we want to diff.
  for (const prop of brunoDiffableProperties) {
    if (prop.startsWith("body:")) {
      const req_body = prop.replace("body:", "");

      if (req_body === "json") {
        // TODO handle the possibe error. Make this fault tolerant.
        temp[req_body] = isValidJsonString(entry.body[req_body])
          ? JSON.parse(entry.body[req_body])
          : undefined;
      } else {
        temp[req_body] = entry.body[req_body];
      }
    } else if (prop === "query") {
      temp[prop] = entry.params ? queryToObj(entry.params) : undefined;
    } else if (prop === "headers") {
      const headers = entry[prop];

      temp[prop] = headers
        ? // Get rid of bruno specific constraints that are not being sent to the target server.
          headersToObj(headers)
        : undefined;
    } else {
      temp[prop] = entry[prop];
    }
  }

  let latest = {};

  // TODO remove undefined properties, since they will not be sent to
  // the target server and it also helps reduce false positives when diffing.
  for (let [k, v] of Object.entries(temp)) {
    if (v) {
      latest[k] = v;
    }
  }

  // return latest as Partial<PreparedBruFile>;
  return latest;
};
