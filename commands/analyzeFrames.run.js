const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const visionService = require("../services/visions");

/**
 * Analyzes video frames using the configured vision service and saves the analysis if requested.
 * @param {{ frames: string[], metadata: object, opts?: { saveFile?: string } }} params - Frames, metadata, and options
 * @returns {Promise<{ frameDescriptions: any }>} The frame analysis results
 */
module.exports = async function ({ frames, metadata, opts }) {
  const { name, analyzeFrames } = visionService;

  logger.log("info", "vision", name, `Analyzing ${frames.length} frames...`);
  const frameDescriptions = await analyzeFrames(frames, metadata);
  logger.log("info", "vision", name, "Analysis complete!");

  if (opts && opts.saveFile) {
    logger.log("info", "vision", "fs-storage", "Saving analysis to file...");
    await storageService.saveTextToFile(frameDescriptions, opts.saveFile);
    logger.log(
      "info",
      "vision",
      "fs-storage",
      "Analysis saved to:",
      opts.saveFile
    );
  }

  return { frameDescriptions };
};
