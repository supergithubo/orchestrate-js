// services/downloaders/index.js

const config = require("../../config");
const key = config.app.services.downloader || "rapidapi-tiktok";

let service;

try {
  service = require(`./${key}.service.js`);

  if (typeof service.downloadVideo !== "function") {
    throw new Error(`Module '${key}' must export a 'downloadVideo' function`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
} catch (err) {
  throw new Error(`Downloader "${key}" failed to load: ${err.message}`);
}

module.exports = service;
