const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const visionService = require("../services/vision");

module.exports = async function ({ frames, metadata }) {
  const { name, analyzeFrames } = visionService;

  logger.log("vision", name, `Analyzing ${frames.length} frames...`);
  const results = await analyzeFrames(frames, metadata);
  logger.log("vision", name, "Analysis complete!");

  const outputPath = path.join("tmp", "analysis.txt");

  logger.log("system", "fs-storage", "Saving analysis to file...");
  await storageService.saveTextToFile(results, outputPath);
  logger.log("system", "fs-storage", "Analysis saved to:", outputPath);

  return { frameDescriptions: results };
};
