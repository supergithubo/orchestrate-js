// commands/generateResponse.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, opts, id }) {
  const llmService = require("../services/llms")(key);
  const { getResponse } = llmService;

  logger.log("info", "language", id, "Generating response...");
  const response = await getResponse(opts);

  return { response };
};
