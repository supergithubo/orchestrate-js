// commands/downloadImages.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const IMAGE_DOWNLOADER = config.app.defaults.downloaders.image;

/**
 * Download images using the specified image downloader service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { imageDownloader: string } specifying the image downloader service key (e.g., "http-download").
 *   If not provided, falls back to config.app.defaults.downloaders.image.
 * @param {Object} args.params - Required parameters for image download.
 * @param {string[]} args.params.urls - Array of image URLs to download. (required)
 * @param {string} args.params.outputDir - Output directory for downloaded images. (required)
 * @throws {Error} If required fields are missing: services.imageDownloader, params.urls, or params.outputDir.
 * @returns {Promise<{imagePaths: string[]}>} - Downloaded image file paths.
 */
module.exports = async function ({ id, services = {}, params }) {
  const imageKey = services.imageDownloader || IMAGE_DOWNLOADER;
  if (!imageKey) {
    throw new Error(
      "services.imageDownloader is required (or set a default in config.app.defaults.downloaders.image)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { urls, outputDir } = params;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw new Error("params.urls (array) is required");
  }
  if (!outputDir) {
    throw new Error("params.outputDir is required");
  }

  const imageDownloader = require("../services/downloaders/image")(imageKey);
  const { downloadImages } = imageDownloader;

  logger.log("info", "downloader/image", id, "Downloading images...");
  const imagePaths = await downloadImages(urls, outputDir);

  return { imagePaths };
};
