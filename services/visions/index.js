// services/visions/index.js

const config = require("../../config");
const key = config.app.services.vision || "openai-vision";

let service;

try {
  service = require(`./${key}.service.js`);
  if (typeof service.analyzeFrames !== "function") {
    throw new Error(`Vision module '${key}' must export 'analyzeFrames'`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
} catch (err) {
  throw new Error(`Vision "${key}" failed to load: ${err.message}`);
}

module.exports = service;
