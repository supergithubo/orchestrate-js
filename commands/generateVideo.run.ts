import config from "../config";
import logger from "../services/logger.service";
import load from "../services/generators/video";

const VIDEO_GENERATOR = config.app.defaults.generators.video;

/**
 * Generate videos using the specified video generator service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { videoGenerator: string } specifying the video generator service key (e.g., "runway-ml").
 *   If not provided, falls back to config.app.defaults.generators.video.
 * @param args.params Required parameters for video generation.
 * @param args.input Prompt message to generate videos from. (required)
 * @param args.params.opts Service-specific options (optional).
 * 
 * @throws Error If required fields are missing: services.videoGenerator.
 * @returns Generated video results.
 */
export default async function run({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { videoGenerator?: string };
  params: { input: string; opts?: any };
}): Promise<{ videos: any[] }> {
  const videoKey = services?.videoGenerator || VIDEO_GENERATOR;
  if (!videoKey) {
    throw new Error(
      "services.videoGenerator is required (or set a default in config.app.defaults.generators.video)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { input, opts } = params;
  if (!input) {
    throw new Error("params.prompt is required");
  }
  if (!opts) {
    throw new Error("params.opts is required");
  }

  const videoGenerator = await load(videoKey);
  const { getVideo } = videoGenerator;

  logger.log("info", "generator/video", id, "Generating video response...");
  const videos = await getVideo(prompt, opts);

  return { videos };
}
