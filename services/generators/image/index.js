// services/generators/image/index.js

const config = require("../../../config");
const key = config.app.services.generators.image || "openai-image";

let service;

try {
  service = require(`./${key}.service.js`);

  if (typeof service.generateImage !== "function") {
    throw new Error(`Module '${key}' must export 'generateImage'`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
} catch (err) {
  throw new Error(`Image generator "${key}" failed to load: ${err.message}`);
}

module.exports = service;
