/**
 * Main Entry Point
 *
 * This file defines the workflow for processing a TikTok video, including download, transcription, frame extraction, analysis, and concept generation.
 * It loads configuration, sets up the workflow steps, and runs the workflow using the runner module.
 *
 * Usage: node index.js
 */
const config = require("./config");
const runWorkflow = require("./runner");
const logger = require("./services/logger.service");

const workflow = [
  {
    type: "series",
    command: "generateImage",
    params: (context) => ({
      prompt:
        "Create a visually striking image of a mukbang with unusual 'Lava Candies'. These candies have a black exterior with glowing orange-red cracks, like molten lava. Show various shapes—spheres, stars, pyramids—and emphasize their gooey, stretchy interior when bitten. The image should feel satisfying and ASMR-like, focusing on textures and visual appeal.",
    }),
    returns: ["images"],
  },
];

(async () => {
  try {
    logger.log("info", "Starting workflow...");
    const result = await runWorkflow(workflow, { config });
    console.log(result)
  } catch (err) {
    logger.logError("Error in workflow:", err);
  }
})();
