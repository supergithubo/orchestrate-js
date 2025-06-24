// services/extractors/index.js

const config = require("../../config");
const key = config.app.extractor || "ffmpeg-frame";

let extractor;

try {
  extractor = require(`./${key}.service.js`);

  if (typeof extractor.extractFrames !== "function") {
    throw new Error(`Module '${key}' must export 'extractFrames'`);
  }
  if (typeof extractor.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
  if (typeof extractor.outputDir !== "string") {
    throw new Error(`Module '${key}' must export 'outputDir'`);
  }
} catch (err) {
  throw new Error(`Extractor "${key}" failed to load: ${err.message}`);
}

module.exports = extractor;
