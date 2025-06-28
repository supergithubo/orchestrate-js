const path = require("path");
require("dotenv").config();

const runWorkflow = require("../../runner");
const logger = require("../../services/logger.service");

const workflow = [
  {
    type: "series",
    command: "generateResponse",
    params: {
      id: "openai-response-gpt-4o-mini",
      services: { llm: "openai-response" },
      params: {
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          input: "Give me a creative image prompt about the sky.",
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
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          id: "openai-image-dall-e-3",
          services: { imageGenerator: "openai-image" },
          params: {
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              prompt: context.prompt,
              model: "dall-e-3",
              size: "1024x1024",
              response_format: "url",
            },
          },
        }),
        returnsAlias: { images: "dall-e-3" },
      },
      {
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          id: "openai-image-dall-e-2",
          services: { imageGenerator: "openai-image" },
          params: {
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              prompt: context.prompt,
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
    type: "series",
    command: "downloadImages",
    params: (context) => ({
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
    type: "series",
    command: "analyzeImages",
    params: (context) => ({
      id: "openai-vision-gpt-4o",
      services: {
        vision: "openai-vision",
      },
      params: {
        images: context.imagePaths,
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o",
          messages: [
            `Compare the two images and tell me which: \n` +
              `1) One better represents this prompt:\n"${context.prompt}" \n` +
              `2) One is more realistic? \n Explain both why`,
          ],
        },
      },
    }),
    returnsAlias: { analysis: "visionAnalysis" },
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
