// commands/generateImageResponse.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const IMAGE_GENERATOR = config.app.defaults.generators.image;

/**
 * Generate images using the specified image generator service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { imageGenerator: string } specifying the image generator service key (e.g., "openai-image").
 *   If not provided, falls back to config.app.defaults.generators.image.
 * @param {Object} args.params - Required parameters for image generation.
 * @param {Object} [args.params.opts] - Service-specific options (optional).
 * @throws {Error} If required fields are missing: services.imageGenerator.
 * @returns {Promise<{images: any[]}>} - Generated image results.
 */
module.exports = async function ({ id, services = {}, params }) {
  const imageKey = services.imageGenerator || IMAGE_GENERATOR;
  if (!imageKey) {
    throw new Error(
      "services.imageGenerator is required (or set a default in config.app.defaults.generators.image)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { opts } = params;
  if (!opts) {
    throw new Error("params.opts is required");
  }

  const imageGenerator = require("../services/generators/image")(imageKey);
  const { getImageResponse } = imageGenerator;

  logger.log("info", "generator/image", id, "Generating image response...");
  const images = await getImageResponse(opts);

  return { images };
};
