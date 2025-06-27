// commands/generateImageResponse.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, opts, name }) {
  const imageGeneratorService = require("../services/generators/image")(key);
  const { getImageResponse } = imageGeneratorService;

  logger.log("info", "generator/image", name, "Generating images...");
  const images = await getImageResponse(opts);

  return { images };
};
