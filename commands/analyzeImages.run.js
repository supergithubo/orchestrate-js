// commands/analyzeImages.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, images, opts, id }) {
  const visionService = require("../services/visions")(key);
  const { analyzeImages } = visionService;

  logger.log("info", "vision", id, "Analyzing images...");
  const analysis = await analyzeImages(images, opts);

  return { analysis };
};
