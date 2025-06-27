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
        "Create image which centers around a visually striking and intriguing mukbang featuring a unique type of candy known as 'Lava Candies'. " +
        "These confections are characterized by their black exterior with luminous orange-red cracks resembling molten lava. Throughout the image, " +
        "the person showcases several types of these candies—spherical, star-shaped, and pyramid-shaped—creating a visually appealing and immersive ASMR experience." +
        "The individual bites into these candies, revealing their stretchy, molten-like interior, which is both satisfyingly gooey and visually mesmerizing. The image" + 
        "plays on the themes of 'oddly satisfying' and 'ASMR,' aiming to captivate viewers with its unique textures and visually stimulating content." +
        "",
    }),
    returns: ["images"],
  },
];

(async () => {
  try {
    logger.log("info", "Starting workflow...");
    const result = await runWorkflow(workflow, { config });
    logger.log("info", result);
  } catch (err) {
    logger.logError("Error in workflow:", err);
  }
})();
