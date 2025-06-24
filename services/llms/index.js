// services/llms/index.js

const config = require("../../config");
const key = config.app.services.llm || "openai";

let service;

try {
  service = require(`./${key}.service.js`);

  if (typeof service.getChatResponse !== "function") {
    throw new Error(`Module '${key}' must export 'getChatResponse'`);
  }
  if (typeof service.name !== "string") {
    throw new Error(`Module '${key}' must export 'name'`);
  }
} catch (err) {
  throw new Error(`LLM "${key}" failed to load: ${err.message}`);
}

module.exports = service;
