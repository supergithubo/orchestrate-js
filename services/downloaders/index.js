// services/downloaders/index.js

const config = require("../../config.json");
const downloaderKey = config.app.downloader || "rapidapi-tiktok";

let service;

try {
  service = require(`./${downloaderKey}.service.js`);

  if (typeof service.downloadVideo !== "function") {
    throw new Error(`Module '${downloaderKey}' must export a 'downloadVideo' function`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${downloaderKey}' must export a string 'name'`);
  }
} catch (err) {
  throw new Error(`Downloader "${downloaderKey}" failed to load: ${err.message}`);
}

module.exports = service;
