import BruToJson from "@usebruno/lang/v2/src/bruToJson";
import JsonToBru from "@usebruno/lang/v2/src/jsonToBru";
import { getObjectStructure, compareRequests } from "../utils/collection";

let snapshotBru = `
meta {
  name: get products
  type: http
  seq: 2
}

get {
  url: http://localhost:3000/products?limit=20&page=2
  body: json
  auth: none
}

query {
  limit: 20
  page: 2
}

headers {
  Authorization: Bearer 22202
  Accept: application/json
  Content-Type: application/json
}

body:json {
  {
    "productId": "id_2929020",
    "sku": "Computers"
  }
}

assert {
  res.status: eq 200
}

script:pre-request {
  console.log("Pre request script")
}

script:post-response {
  let headers = req.getHeaders();
  console.log(headers)
}

docs {
  The is a demo documentation for get_products.
}
`;

let latestBru = `
meta {
  name: get products
  type: http
  seq: 2
}

get {
  url: http://localhost:3000/products?limit=20&page=2
  body: json
  auth: none
}

query {
  limit: 20
  page: 2
}

headers {
  Authorization: Bearer 22202
  Accept: application/json
  Content-Type: application/json
}

body:json {
  {
    "productId": "id_2929020",
    "sku": "Computers"
  }
}


assert {
  res.status: eq 200
}

script:pre-request {
  console.log("Pre request script")
}

script:post-response {
  let headers = req.getHeaders();
  console.log(headers)
}

docs {
  The is a demo documentation for get_products.
}
`;

const diffableProperties = [
  "headers",
  "body:json",
  "body:text",
  "body:form-urlencoded",
  "body:multipart-form",
] as const;

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
// let latest = bru_to_json(latestBru) as BruFile;
let from_snapshot = {};

export const bruFileToJson = (request: string): BruFile => BruToJson(request);
export const jsonToBruFile = (request: Partial<BruFile>): string =>
  JsonToBru(request);

// if(!db.includes("request path")) { add request to db and update commit. }

// let ob = {
//   Authorization: "Bearer 10o2o2",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   unknown_array: [],
// };

// let ob2 = {
//   Authorization: "Bearer 10o2o2",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   unknown_array: [],
// };
