const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const downloaderService = require("../services/downloaders");

/**
 * Downloads a TikTok video using the configured downloader service and saves it to disk.
 * @param {{ videoUrl: string, outputFile: { prefix: string, ext: string, folder: string } }} params - Video URL and output file config
 * @returns {Promise<{ filePath: string, metadata: object }>} The saved file path and video metadata
 */
module.exports = async function ({ videoUrl, outputFile }) {
  const { name, downloadVideo } = downloaderService;

  logger.log("info", "downloader", name, "Starting video download:", videoUrl);
  const { stream, metadata } = await downloadVideo(videoUrl);
  logger.log("info", "downloader", name, "Video stream received!");

  const { prefix, ext, folder } = outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  logger.log("info", "downloader", "fs-storage", "Saving video...");
  storageService.ensureDirExists(folder);
  storageService.clearFolder(folder);
  await storageService.saveStreamToFile(stream, filePath);
  logger.log("info", "downloader", "fs-storage", "Video saved to:", filePath);

  return { filePath, metadata };
};
