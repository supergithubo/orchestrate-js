// commands/generateResponse.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const LLM = config.app.defaults.llm;

/**
 * Generate a language model response using the specified LLM service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { llm: string } specifying the LLM service key (e.g., "openai-response").
 *   If not provided, falls back to config.app.defaults.llm.
 * @param {Object} args.params - Required parameters for LLM response.
 * @param {Object} args.params.opts - Options for the LLM service. (required)
 * @throws {Error} If required fields are missing: services.llm or params.opts.
 * @returns {Promise<{response: any}>} - LLM response result.
 */
module.exports = async function ({ id, services = {}, params }) {
  const llmKey = services.llm || LLM;
  if (!llmKey) {
    throw new Error(
      "services.llm is required (or set a default in config.app.defaults.llm)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { opts } = params;
  if (!opts) {
    throw new Error("params.opts is required");
  }

  const llm = require("../services/llms")(llmKey);
  const { getResponse } = llm;

  logger.log("info", "llm", id, "Generating response...");
  const response = await getResponse(opts);

  return { response };
};
