import config from "../config";
import logger from "../services/logger.service";
import load from "../services/downloaders/image";

const IMAGE_DOWNLOADER = config.app.defaults.downloaders.image;

/**
 * Download images using the specified image downloader service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { imageDownloader: string } specifying the image downloader service key (e.g., "http-download").
 *   If not provided, falls back to config.app.defaults.downloaders.image.
 * @param args.params Required parameters for image download.
 * @param args.params.urls Array of image URLs to download. (required)
 * @param args.params.outputDir Output directory for downloaded images. (required)
 * 
 * @throws Error If required fields are missing: services.imageDownloader, params.urls, or params.outputDir.
 * @returns Downloaded image file paths.
 */
export default async function run({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { imageDownloader?: string };
  params: { urls: string[]; outputDir: string };
}): Promise<{ imagePaths: string[] }> {
  const imageKey = services?.imageDownloader || IMAGE_DOWNLOADER;
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

  const imageDownloader = await load(imageKey);
  const { downloadImages } = imageDownloader;

  logger.log("info", "downloader/image", id, "Downloading images...");
  const imagePaths = await downloadImages(urls, outputDir);

  return { imagePaths };
}
