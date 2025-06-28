const path = require("path");

require("dotenv").config();

const config = require("./config");
const runWorkflow = require("./runner");
const logger = require("./services/logger.service");

const workflow = [
  {
    type: "series",
    command: "generateResponse",
    params: {
      service: "openai-response",
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        input: "Hello, make me a prompt for an image of a cat.",
        model: "gpt-4o-mini",
      },
      name: "openai-response-gpt-4o-mini",
    },
    returnsAlias: { response: "prompt" },
  },
];

(async () => {
  try {
    logger.log("info", "Starting workflow...");
    const result = await runWorkflow(workflow, {});
    console.log(result);
  } catch (err) {
    logger.logError(err, "Error in workflow:");
  }
})();
