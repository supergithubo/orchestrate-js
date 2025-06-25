const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const extractorService = require("../services/extractors");

module.exports = async function ({ filePath }) {
  const { name, outputDir, extractFrames } = extractorService;

  logger.log("extractor", name, "Extracting frames...");
  storageService.ensureDirExists(outputDir);
  storageService.clearFolder(outputDir);

  const frames = await extractFrames(filePath);
  logger.log(
    "extractor",
    name,
    `Extracted ${frames.length} frames to:`,
    outputDir
  );

  return { frames };
};
