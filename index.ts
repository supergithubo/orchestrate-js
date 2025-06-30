import dotenv from "dotenv";
dotenv.config();

import runWorkflow from "./runner";
import logger from "./services/logger.service";

import type { WorkflowStep } from "./runner";

const workflow: WorkflowStep[] = [
  {
    type: "series",
    command: "getResponse",
    params: {
      services: { llm: "openai-completion" },
      params: {
        input: [
          {
            role: "user",
            content: "Hello, make me a prompt for an image of a cat.",
          },
        ],
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o-mini",
        },
      },
      id: "openai-completion-gpt-4o-mini",
    },
    returnsAlias: { response: "prompt" },
  },
];

(async () => {
  try {
    logger.log("info", "Starting workflow...");
    const result = await runWorkflow(workflow, {});
    console.log(result);
  } catch (err: any) {
    logger.logError(err, "Error in workflow:");
  }
})();
