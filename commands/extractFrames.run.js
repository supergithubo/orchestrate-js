// commands/extractFrames.run.js

const logger = require("../services/logger.service");

module.exports = async function ({
  service: key,
  videoPath,
  outputDir,
  opts,
  name,
}) {
  const extractorService = require("../services/extractors/frame")(key);
  const { extractFrames } = extractorService;

  logger.log("info", "extractor/frame", name, "Extracting frames...");
  const framePaths = await extractFrames(videoPath, outputDir, opts);

  return { framePaths };
};
