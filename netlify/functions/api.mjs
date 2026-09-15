import express from "express";
import serverless from "serverless-http";
import app from "../../src/index.js";

// Netlify invokes this function through the rewrite to "/.netlify/functions/api/:splat".
// Depending on how the request is routed, the function receives either the original
// client path ("/api/customers") or the internal function path
// ("/.netlify/functions/api/customers"). Normalize both to "/api/..." so the Express
// routes defined in src/index.js always match.
const FUNCTION_PREFIX = "/.netlify/functions/api";

const handlerApp = express();

handlerApp.use((req, _res, next) => {
  if (req.url.startsWith(FUNCTION_PREFIX)) {
    req.url = `/api${req.url.slice(FUNCTION_PREFIX.length)}`;
  }
  next();
});

handlerApp.use(app);

export const handler = serverless(handlerApp);
