import dotenv from "dotenv";
import path from "path";
dotenv.config();

import type { WorkflowStep } from "../../runner";
import runWorkflow from "../../runner";
import logger from "../../services/logger.service";

const workflow: WorkflowStep[] = [
  {
    type: "series",
    command: "describeImages",
    params: {
      id: "openai-vision",
      services: { vision: "openai-vision" },
      params: {
        images: ["/home/super/Repo/orchestrate-js/tmp/sample.png"],
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content:
                `You are an expert video specialist, make me a prompt to generate a 960x960 5-second video from the image`,
            },
          ],
        },
      },
    },
    returnsAlias: { description: "prompt" },
  },
  {
    type: "series",
    command: "generateVideoFromImageX",
    params: (context: any) => ({
      services: { image2videoConverter: "runway-ml" },
      params: {
        image: "/home/super/Repo/orchestrate-js/tmp/sample.png",
        prompt: context.prompt,
        outputDir: path.resolve(__dirname, "../../tmp"),
        opts: {
          apiKey: process.env.RUNWAYML_API_KEY,
          model: "gen4_turbo",
          ratio: "960:960",
          duration: 5,
        },
      },
      id: "runway-ml-gen4-turbo",
    }),
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
