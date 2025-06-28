// commands/downloadImages.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, urls, outputDir, id }) {
  const imageDownloaderService = require("../services/downloaders/image")(key);
  const { downloadImages } = imageDownloaderService;

  logger.log("info", "downloader/image", id, "Downloading images...");
  const imagePaths = await downloadImages(urls, outputDir);

  return { imagePaths };
};
