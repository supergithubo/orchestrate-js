// commands/downloadVideos.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const VIDEO_DOWNLOADER = config.app.defaults.downloaders.video;

/**
 * Download videos using the specified video downloader service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { videoDownloader: string } specifying the video downloader service key (e.g., "rapidapi-tiktok").
 *   If not provided, falls back to config.app.defaults.downloaders.video.
 * @param {Object} args.params - Required parameters for video download.
 * @param {string[]} args.params.urls - Array of video URLs to download. (required)
 * @param {string} args.params.outputDir - Output directory for downloaded videos. (required)
 * @param {Object} [args.params.opts] - Service-specific options (optional).
 * @throws {Error} If required fields are missing: services.videoDownloader, params.urls, or params.outputDir.
 * @returns {Promise<{videoPaths: string[]}>} - Downloaded video file paths.
 */
module.exports = async function ({ id, services = {}, params }) {
  const videoKey = services.videoDownloader || VIDEO_DOWNLOADER;
  if (!videoKey) {
    throw new Error(
      "services.videoDownloader is required (or set a default in config.app.defaults.downloaders.video)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { urls, outputDir, opts } = params;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw new Error("params.urls (array) is required");
  }
  if (!outputDir) {
    throw new Error("params.outputDir is required");
  }

  const videoDownloader = require("../services/downloaders/video")(videoKey);
  const { downloadVideos } = videoDownloader;

  logger.log("info", "downloader/video", id, "Downloading videos...");
  const videoPaths = await downloadVideos(urls, outputDir, opts);

  return { videoPaths };
};
