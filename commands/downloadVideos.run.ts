import config from "../config";
import logger from "../services/logger.service";
import loadVideoDownloader from "../services/downloaders/video";

const VIDEO_DOWNLOADER = config.app.defaults.downloaders.video;

/**
 * Download videos using the specified video downloader service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { videoDownloader: string } specifying the video downloader service key (e.g., "rapidapi-tiktok").
 *   If not provided, falls back to config.app.defaults.downloaders.video.
 * @param args.params Required parameters for video download.
 * @param args.params.urls Array of video URLs to download. (required)
 * @param args.params.outputDir Output directory for downloaded videos. (required)
 * @param args.params.opts Service-specific options (optional).
 * @throws Error If required fields are missing: services.videoDownloader, params.urls, or params.outputDir.
 * @returns Downloaded video file paths.
 */
export default async function downloadVideosRun({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { videoDownloader?: string };
  params: { urls: string[]; outputDir: string; opts?: any };
}): Promise<{ videoPaths: string[] }> {
  const videoKey = services?.videoDownloader || VIDEO_DOWNLOADER;
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

  const videoDownloader = await loadVideoDownloader(videoKey);
  const { downloadVideos } = videoDownloader;

  logger.log("info", "downloader/video", id, "Downloading videos...");
  const videoPaths = await downloadVideos(urls, outputDir, opts);

  return { videoPaths };
}
