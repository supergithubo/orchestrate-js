// services/transcribers/index.js

const config = require("../../config");
const key = config.app.services.transcriber || "openai-whisper";

let service;

try {
  service = require(`./${key}.service.js`);

  if (typeof service.getAudioTranscription !== "function") {
    throw new Error(`Module '${key}' must export 'getAudioTranscription'`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
} catch (err) {
  throw new Error(`Transcriber "${key}" failed to load: ${err.message}`);
}

module.exports = service;
