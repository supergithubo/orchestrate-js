import dotenv from "dotenv";
import path from "path";
dotenv.config();

import type { WorkflowStep } from "../../runner";
import runWorkflow from "../../runner";
import logger from "../../services/logger.service";

const workflow: WorkflowStep[] = [
  {
    type: "series",
    commands: [
      {
        command: "getResponse",
        params: {
          id: "openai-response-gpt-4o-mini",
          services: { llm: "openai-response" },
          params: {
            input: "Give me a creative image prompt about the sky.",
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              model: "gpt-4o-mini",
            },
          },
        },
        returnsAlias: { response: "prompt" },
      },
      {
        type: "parallel",
        commands: [
          {
            command: "generateImage",
            params: (context: any) => ({
              id: "openai-image-dall-e-3",
              services: { imageGenerator: "openai-image" },
              params: {
                prompt: context.prompt,
                opts: {
                  apiKey: process.env.OPENAI_API_KEY,
                  model: "dall-e-3",
                  size: "1024x1024",
                  response_format: "url",
                },
              },
            }),
            returnsAlias: { images: "dall-e-3" },
          },
          {
            command: "generateImage",
            params: (context: any) => ({
              id: "openai-image-dall-e-2",
              services: { imageGenerator: "openai-image" },
              params: {
                prompt: context.prompt,
                opts: {
                  apiKey: process.env.OPENAI_API_KEY,
                  model: "dall-e-2",
                  size: "1024x1024",
                  response_format: "url",
                },
              },
            }),
            returnsAlias: { images: "dall-e-2" },
          },
        ],
      },
      {
        command: "downloadImages",
        params: (context: any) => ({
          id: "http-download",
          services: { imageDownloader: "http-download" },
          params: {
            urls: [context["dall-e-3"]?.[0], context["dall-e-2"]?.[0]],
            outputDir: path.resolve(__dirname, "../../tmp"),
          },
        }),
        returns: ["imagePaths"],
      },
      {
        command: "describeImages",
        params: (context: any) => ({
          id: "openai-vision",
          services: { vision: "openai-vision" },
          params: {
            images: context.imagePaths,
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content:
                    `Compare the two images and tell me which: \n` +
                    `1) One better represents this prompt:\n"${context.prompt}" \n` +
                    `2) One is more realistic? \n Explain both why`,
                },
              ],
            },
          },
        }),
        returnsAlias: { description: "visionAnalysis" },
      },
    ],
  },
];

(async () => {
  try {
    logger.log("info", "Starting prompt-to-model-comparison workflow...");
    logger.log("info");
    const result = await runWorkflow(workflow, {});
    console.log(result);
  } catch (err: any) {
    logger.logError(err, "Error in workflow:");
  }
})();
