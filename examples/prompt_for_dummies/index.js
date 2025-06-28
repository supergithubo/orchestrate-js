const path = require("path");
require("dotenv").config();

const runWorkflow = require("../../runner");
const logger = require("../../services/logger.service");

const workflow = [
  {
    type: "series",
    command: "generateResponse",
    params: {
      service: "openai-response",
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        input:
          "I'm a dumb user that can't imagine anything. Make me an image prompt about the sky.",
        model: "gpt-4o-mini",
      },
      name: "openai-response-gpt-4o-mini",
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
          service: "openai-image",
          opts: {
            apiKey: process.env.OPENAI_API_KEY,
            prompt: context.prompt,
            model: "dall-e-3",
            size: "1024x1024",
            response_format: "url",
          },
          name: "openai-image-dall-e-3",
        }),
        returnsAlias: { images: "dall-e-3" },
      },
      {
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          service: "openai-image",
          opts: {
            apiKey: process.env.OPENAI_API_KEY,
            prompt: context.prompt,
            model: "dall-e-2",
            size: "1024x1024",
            response_format: "url",
          },
          name: "openai-image-dall-e-2",
        }),
        returnsAlias: { images: "dall-e-2" },
      },
    ],
  },
  {
    type: "series",
    command: "downloadImages",
    params: (context) => ({
      service: "http-download",
      urls: [context["dall-e-3"]?.[0], context["dall-e-2"]?.[0]],
      outputDir: path.resolve(__dirname, "../../tmp"),
      name: "http-download",
    }),
    returns: ["imagePaths"],
  },
  {
    type: "series",
    command: "analyzeImages",
    params: (context) => ({
      service: "openai-vision",
      images: context.imagePaths,
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
        message:
          `Compare the two images and tell me which: \n` +
          `1) One better represents this prompt:\n"${context.prompt}" \n` +
          `2) One is more realistic? \n Explain both why`,
      },
      name: "openai-vision-gpt-4o",
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
