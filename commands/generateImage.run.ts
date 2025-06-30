import config from "../config";
import logger from "../services/logger.service";
import load from "../services/generators/image";

const IMAGE_GENERATOR = config.app.defaults.generators.image;

/**
 * Generate images using the specified image generator service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { imageGenerator: string } specifying the image generator service key (e.g., "openai-image").
 *   If not provided, falls back to config.app.defaults.generators.image.
 * @param args.params Required parameters for image generation.
 * @param args.prompt Prompt message to generate images from. (required)
 * @param args.params.opts Service-specific options (optional).
 * 
 * @throws Error If required fields are missing: services.imageGenerator.
 * @returns Generated image results.
 */
export default async function run({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { imageGenerator?: string };
  params: { prompt: string; opts?: any };
}): Promise<{ images: any[] }> {
  const imageKey = services?.imageGenerator || IMAGE_GENERATOR;
  if (!imageKey) {
    throw new Error(
      "services.imageGenerator is required (or set a default in config.app.defaults.generators.image)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { prompt, opts } = params;
  if (!prompt) {
    throw new Error("params.prompt is required");
  }
  if (!opts) {
    throw new Error("params.opts is required");
  }

  const imageGenerator = await load(imageKey);
  const { getImage } = imageGenerator;

  logger.log("info", "generator/image", id, "Generating image response...");
  const images = await getImage(prompt, opts);

  return { images };
}
