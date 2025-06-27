

const logger = require("../services/logger.service");
const imageGeneratorService = require("../services/generators/image");

module.exports = async function ({ prompt, opts = {} }) {
  const { name, generateImage } = imageGeneratorService;

  logger.log("info", "generator/image", name, "Generating images...");
  const images = await generateImage(prompt, opts);

  return { images };
};
