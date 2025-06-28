// commands/analyzeImages.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const VISION = config.app.defaults.vision;

/**
 * Analyze images using a vision service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { vision: string } specifying the vision service key (e.g., "openai-vision").
 *   If not provided, falls back to config.app.defaults.vision.
 * @param {Object} args.params - Required parameters for analysis.
 * @param {string[]} args.params.images - Array of image file paths to analyze. (required)
 * @param {Object} [args.params.opts] - Service-specific options (optional).
 * @throws {Error} If required fields are missing: services.vision or params.images.
 * @returns {Promise<{analysis: any}>} - Analysis result object.
 */
module.exports = async function ({ id, services = {}, params }) {
  const visionKey = services.vision || VISION;
  if (!visionKey) {
    throw new Error(
      "services.vision is required (or set a default in config.app.defaults.vision)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { images, opts } = params;
  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new Error("params.images (array) is required");
  }

  const vision = require("../services/visions")(visionKey);
  const { analyzeImages } = vision;

  logger.log("info", "vision", id, "Analyzing images...");
  const analysis = await analyzeImages(images, opts);

  return { analysis };
};
