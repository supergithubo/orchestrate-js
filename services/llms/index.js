// services/llms/index.js

const config = require("../../config");
const key = config.app.llm || "openai";

let service;

try {
  service = require(`./${key}.service.js`);

  if (typeof service.getChatResponse !== "function") {
    throw new Error(`Module '${key}' must export 'getChatResponse'`);
  }
  if (typeof service.getAudioTranscription !== "function") {
    throw new Error(`Module '${key}' must export 'getAudioTranscription'`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
  if (typeof service.chatModel !== "string") {
    throw new Error(`Module '${key}' must export 'chatModel'`);
  }
  if (typeof service.transcriptionModel !== "string") {
    throw new Error(`Module '${key}' must export 'transcriptionModel'`);
  }
} catch (err) {
  throw new Error(`LLM "${key}" failed to load: ${err.message}`);
}

module.exports = service;
