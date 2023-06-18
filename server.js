const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const apiMetrics = require("prometheus-api-metrics");
const promBundle = require("express-prom-bundle");

const app = express();
const port = 7000;

app.use(bodyParser.urlencoded({ extended: true })); //
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(apiMetrics());

// const { ROUTES } = require("./routes");
// const { setupProxies } = require("./proxy");
// setupProxies(app, ROUTES);

const { createProxyMiddleware } = require("http-proxy-middleware");

const authProxy = createProxyMiddleware({
  target: "http://localhost:4003/api/v1/",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "ebdigital", // Replace '/api' with the route prefix you want to remove or modify
    // Additional path rewrite rules, if needed
    // '^/old-route': '/new-route',
  },
  onProxyReq: (proxyReq, request, response) => {
    console.log("im in proxy request");
    console.log(proxyReq.getHeaders("Content-Type"));
    proxyReq.setHeader("Authorization", "Bearer your-access-token");
    response.send(JSON.stringify("OK"));
  },
});

app.use("/api", authProxy);

// app.get("/testPurpose", authProxy, (req, resp) => {
//   return resp.send("HELLO WORLD!");
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
