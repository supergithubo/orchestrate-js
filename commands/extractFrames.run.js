// commands/extractFrames.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const FRAME_EXTRACTOR = config.app.defaults.extractors.frame;

/**
 * Extract frames from a video using the specified frame extractor service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { frameExtractor: string } specifying the frame extractor service key (e.g., "ffmpeg-frame").
 *   If not provided, falls back to config.app.defaults.extractors.frame.
 * @param {Object} args.params - Required parameters for frame extraction.
 * @param {string} args.params.videoPath - Path to the video file. (required)
 * @param {string} args.params.outputDir - Output directory for extracted frames. (required)
 * @param {Object} [args.params.opts] - Service-specific options (optional).
 * @throws {Error} If required fields are missing: services.frameExtractor, params.videoPath, or params.outputDir.
 * @returns {Promise<{framePaths: string[]}>} - Extracted frame file paths.
 */
module.exports = async function ({ id, services = {}, params }) {
  const frameKey = services.frameExtractor || FRAME_EXTRACTOR;
  if (!frameKey) {
    throw new Error(
      "services.frameExtractor is required (or set a default in config.app.defaults.extractors.frame)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { videoPath, outputDir, opts } = params;
  if (!videoPath) {
    throw new Error("params.videoPath is required");
  }
  if (!outputDir) {
    throw new Error("params.outputDir is required");
  }

  const frameExtractor = require("../services/extractors/frame")(frameKey);
  const { extractFrames } = frameExtractor;

  logger.log("info", "extractor/frame", id, "Extracting frames...");
  const framePaths = await extractFrames(videoPath, outputDir, opts);

  return { framePaths };
};
