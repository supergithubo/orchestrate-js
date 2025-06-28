// commands/downloadVideos.run.js

const logger = require("../services/logger.service");

module.exports = async function ({
  service: key,
  urls,
  outputDir,
  opts,
  name,
}) {
  const videoDownloaderService = require("../services/downloaders/video")(key);
  const { downloadVideos } = videoDownloaderService;

  logger.log("info", "downloader/video", name, "Downloading videos...");
  const videoPaths = await downloadVideos(urls, outputDir, opts);

  return { videoPaths };
};
