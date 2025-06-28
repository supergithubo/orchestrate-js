// commands/generateImageResponse.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, opts, id }) {
  const imageGeneratorService = require("../services/generators/image")(key);
  const { getImageResponse } = imageGeneratorService;

  logger.log("info", "generator/image", id, "Generating images...");
  const images = await getImageResponse(opts);

  return { images };
};
