// commands/generateImage.run.js

const logger = require("../services/logger.service");
const imageGeneratorService = require("../services/generators/image");

/**
 * Generates images from a prompt using the configured image generator service.
 * @param {{ prompt: string, opts?: object }} params - The image prompt and optional generation settings
 * @returns {Promise<{ images: any }>} The generated images
 */
module.exports = async function ({ prompt, opts = {} }) {
  const { name, generateImage } = imageGeneratorService;

  logger.log("info", "generator/image", name, "Generating images...");
  const images = await generateImage(prompt, opts);

  return { images };
};
