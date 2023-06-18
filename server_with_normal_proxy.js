const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser"); // body parser is a middleware process to send data to a http body in 4 types, JSON, raw data, text, url-endocded
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = 7000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (referesh time)
  max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests

app.use(bodyParser.urlencoded({ extended: true })); //
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(limiter);

// Define routing rules for your API Gateway
app.get("/gateway/service1/*", limiter, (req, res) => {
  const url = `http://localhost:4003${req.originalUrl.replace(
    "/gateway/service1",
    "/api/v1"
  )}`;
  proxyRequest(url, req, res);
});

app.post("/gateway/service1/*", (req, res) => {
  console.log("im here");
  const url = `http://localhost:4003${req.originalUrl.replace(
    "/gateway/service1",
    "/api/v1"
  )}`;
  postProxy(url, req, res);
});

// Proxy the request to the backend service
function proxyRequest(url, req, res) {
  console.log(req.method);
  console.log(req.body);
  console.log(req.headers);
  axios({
    method: req.method,
    url,
    data: req.body,
    headers: req.headers,
  })
    .then((response) => {
      console.log;
      res.status(response.status).json(response.data);
    })
    .catch((error) => {
      console.log("im in error");
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    });
}

// Proxy the request to the backend service
function postProxyRequest(url, req, res) {
  console.log(url);
  console.log(req.method);
  console.log(JSON.stringify(req.body));
  console.log(req.headers);
  let my_headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "Token",
    "Access-Control-Allow-Origin": "*",
  };
  axios
    .post({
      url: "http://localhost:3001/mypost",
      data: {},
      headers: my_headers,
    })
    .then((response) => {
      console.log;
      res.status(response.status).json(response.data);
    })
    .catch((error) => {
      console.log("im in error");
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    });
}

async function postProxy(url, req, res) {
  console.log(url);
  // Define the API endpoint and payload
  const apiUrl = url; //"http://localhost:3001/mypost";
  const payload = req.body;

  // Make a POST request to the API
  axios
    .post(apiUrl, payload)
    .then((response) => {
      console.log("Response:", response.data);
      res.send(response.data);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

// Start the API Gateway server
app.listen(PORT, () => {
  console.log(`API Gateway server is running on port ${PORT}`);
});
