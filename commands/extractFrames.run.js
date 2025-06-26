const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const extractorService = require("../services/extractors");

/**
 * Extracts frames from a video file using the configured extractor service.
 * @param {{ filePath: string }} params - The path to the video file
 * @returns {Promise<{ frames: string[] }>} The extracted frame file paths
 */
module.exports = async function ({ filePath }) {
  const { name, outputDir, extractFrames } = extractorService;

  logger.log("info", "extractor", name, "Extracting frames...");
  storageService.ensureDirExists(outputDir);
  storageService.clearFolder(outputDir);

  const frames = await extractFrames(filePath);
  logger.log(
    "info",
    "extractor",
    name,
    `Extracted ${frames.length} frames to:`,
    outputDir
  );

  return { frames };
};
