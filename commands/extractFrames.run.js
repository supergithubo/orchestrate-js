// commands/extractFrames.run.js

const logger = require("../services/logger.service");

module.exports = async function ({
  service: key,
  videoPath,
  outputDir,
  opts,
  id,
}) {
  const extractorService = require("../services/extractors/frame")(key);
  const { extractFrames } = extractorService;

  logger.log("info", "extractor/frame", id, "Extracting frames...");
  const framePaths = await extractFrames(videoPath, outputDir, opts);

  return { framePaths };
};
