import config from "../config";
import logger from "../services/logger.service";
import load from "../services/visions";

const VISION = config.app.defaults.vision;

/**
 * Describe images using a vision service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { vision: string } specifying the vision service key (e.g., "openai-vision").
 *   If not provided, falls back to config.app.defaults.vision.
 * @param args.params Required parameters for analysis.
 * @param args.params.images Array of image file paths to analyze. (required)
 * @param args.params.opts Service-specific options (optional).
 * 
 * @throws Error If required fields are missing: services.vision or params.images.
 * @returns Analysis result object.
 */
export default async function run({
  id,
  services,
  params,
}: {
  id: string;
  services: { vision: string };
  params: { images: string[], opts?: any };
}): Promise<{ description: any }> {
  const visionKey = services?.vision || VISION;
  if (!visionKey) {
    throw new Error(
      "services.vision is required (or set a default in config.app.defaults.vision)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { images, opts } = params;
  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new Error("params.images (array) is required");
  }

  const vision = await load(visionKey);
  const { describeImages } = vision;

  logger.log("info", "vision", id, "Describing images...");
  const description = await describeImages(images, opts);

  return { description };
}
