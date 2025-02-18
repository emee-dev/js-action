const changedFilesInPR = new Map<string, string>();

changedFilesInPR.set(
  "./collections/create user.bru",
  `
meta {
  name: create user
  type: http
  seq: 5
}

post {
  url: http://localhost:3000/user
  body: json
  auth: basic
}

headers {
  Accept: application/json
  Content-Type: application/json
  x-redis-ratelimit: 5000
}

auth:basic {
  username: samuel212
  password: YUSmmxo31001
}

body:json {
  {
    "username": "user@gmail.com",
    "firstname": "samuel",
    "lastname": "john",
    "age": 34,
    "hobbies": [
      "video games",
      "swimming",
      "racing"
    ],
    "isMale": true
  }
}

vars:pre-request {
  API_KEY: api_Buek2001
} 
`
);
changedFilesInPR.set(
  "./collections/delete product.bru",
  `
  meta {
  name: delete product
  type: http
  seq: 4
}

delete {
  url: http://localhost:3000/products
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
  X-rate-limit: 200
  User-Agent: web
}

body:json {
  {
    "product_id": "2001ks02iis"
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
`
);

export default changedFilesInPR;
