// services/llms/index.js

const config = require("../../config.json");
const llmKey = config.app.llm || "openai";

let service;

try {
  service = require(`./${llmKey}.service.js`);

  if (typeof service.getChatResponse !== "function") {
    throw new Error(`Module '${llmKey}' must export 'getChatResponse'`);
  }
  if (typeof service.getAudioTranscription !== "function") {
    throw new Error(`Module '${llmKey}' must export 'getAudioTranscription'`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${llmKey}' must export a string 'name'`);
  }
  if (typeof service.chatModel !== "string") {
    throw new Error(`Module '${llmKey}' must export a string 'chatModel'`);
  }
  if (typeof service.transcriptionModel !== "string") {
    throw new Error(`Module '${llmKey}' must export a string 'transcriptionModel'`);
  }
} catch (err) {
  throw new Error(`LLM "${llmKey}" failed to load: ${err.message}`);
}

module.exports = service;
