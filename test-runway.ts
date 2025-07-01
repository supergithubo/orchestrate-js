import dotenv from "dotenv";
import path from "path";
dotenv.config();

import runWorkflow from "./runner";
import logger from "./services/logger.service";

import type { WorkflowStep } from "./runner";

const workflow: WorkflowStep[] = [
  {
    type: "series",
    command: "generateVideoFromImage",
    params: {
      services: { image2videoConverter: "runway-ml" },
      params: {
        image: "E:\\SUPER\\Repo\\meatspace\\orchestrate-js\\tmp\\sample.png",
        prompt: "Make all objects move. Make the sky sway and the subject",
        outputDir: path.resolve(__dirname, "../../tmp"),
        opts: {
          apiKey: "awdawdw",
          model: "gen4_turbo",
          ratio: "960:960",
          duration: 5,
        },
      },
      id: "runway-ml-gen4-turbo",
    },
    returnsAlias: { videoPaths: "paths" },
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
