const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const visionService = require("../services/vision");

module.exports = async function ({ frames, metadata, opts }) {
  const { name, analyzeFrames } = visionService;

  logger.log("vision", name, `Analyzing ${frames.length} frames...`);
  const frameDescriptions = await analyzeFrames(frames, metadata);
  logger.log("vision", name, "Analysis complete!");

  if (opts && opts.saveFile) {
    logger.log("vision", "fs-storage", "Saving analysis to file...");
    await storageService.saveTextToFile(frameDescriptions, opts.saveFile);
    logger.log("vision", "fs-storage", "Analysis saved to:", opts.saveFile);
  }

  return { frameDescriptions };
};
