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
    params: (context: any) => ({
      id: "openai-vision",
      services: { vision: "openai-vision" },
      params: {
        images: [context.image],
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content:
                `You are a master anime filmmaker and visual director.` +
                `Based on the image, write a prompt (less than 900 characters) to generate a video animation. ` +
                `The animation should feature subtle ambient motion such as soft lighting shifts, gentle parallax for depth, and calm environmental movement. ` +
                `The result should evoke a peaceful, cinematic, and nostalgic atmosphere. ` +
                `The scene must retain the hand-drawn aesthetic and vibrant colors of the original image. ` +
                `The prompt should be clean, detailed, and suitable for an image-to-video AI model.`,
            },
          ],
        },
      },
    }),
    returnsAlias: { description: "prompt" },
  },
  {
    type: "series",
    command: "generateVideoFromImage",
    params: (context: any) => ({
      services: { image2videoConverter: "runway-ml" },
      params: {
        image: context.image,
        prompt: context.prompt[0],
        outputDir: path.resolve(__dirname, "../../tmp"),
        opts: {
          apiKey: process.env.RUNWAYML_API_KEY,
          model: "gen4_turbo",
          ratio: "832:1104",
          contentModeration: { publicFigureThreshold: "low" },
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
    const result = await runWorkflow(workflow, {
      image: path.resolve(__dirname, "../../tmp/sample.png"),
    });
    console.log(result);
  } catch (err: any) {
    logger.logError(err, "Error in workflow:");
  }
})();
