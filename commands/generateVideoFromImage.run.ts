import config from "../config";
import load from "../services/converters/image2video";
import logger from "../services/logger.service";

const IMAGE_TO_VIDEO_CONVERTER = config.app.defaults.converters.imageToVideo;

/**
 * Convert image to video using the specified image2video converter service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { image2videoConverter: string } specifying the image2video converter service key (e.g., "runway-ml").
 *   If not provided, falls back to config.app.defaults.converters.imageToVideo.
 * @param args.params Required parameters for convertion.
 * @param args.params.image Path to the input image file (JPEG/PNG/etc)
 * @param args.params.prompt Text prompt describing the desired video (required)
 * @param args.params.outputDir Directory where downloaded videos will be saved (required)
 * @param args.params.opts Service-specific options (optional).
 *
 * @throws Error If required fields are missing: services.image2videoConverter.
 * @returns Generated video results.
 */
export default async function run({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { image2videoConverter?: string };
  params: { image: string; prompt: string; outputDir: string; opts?: any };
}): Promise<{ videoPaths: string[] }> {
  const converterKey =
    services?.image2videoConverter || IMAGE_TO_VIDEO_CONVERTER;
  if (!converterKey) {
    throw new Error(
      "services.image2videoConverter is required (or set a default in config.app.defaults.converters.imageToVideo)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { image, prompt, outputDir, opts } = params;
  if (!image) {
    throw new Error("params.image is required");
  }
  if (!prompt) {
    throw new Error("params.prompt is required");
  }
  if (!outputDir) {
    throw new Error("params.outputDir is required");
  }
  if (!opts) {
    throw new Error("params.opts is required");
  }

  const image2videoConverter = await load(converterKey);
  const { imageToVideo } = image2videoConverter;

  logger.log("info", "generator/video", id, "Generating video response...");
  const videoPaths = await imageToVideo(image, prompt, outputDir, opts);

  return { videoPaths };
}
