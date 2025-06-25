const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const downloaderService = require("../services/downloaders");

module.exports = async function ({ videoUrl, outputFile }) {
  const { name, downloadVideo } = downloaderService;

  logger.log("downloader", name, "Starting video download:", videoUrl);
  const { stream, metadata } = await downloadVideo(videoUrl);
  logger.log("downloader", name, "Video stream received!");

  const { prefix, ext, folder } = outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  logger.log("system", "fs-storage", "Saving video...");
  storageService.ensureDirExists(folder);
  storageService.clearFolder(folder);
  await storageService.saveStreamToFile(stream, filePath);
  logger.log("system", "fs-storage", "Video saved to:", filePath);

  return { filePath, metadata };
};
