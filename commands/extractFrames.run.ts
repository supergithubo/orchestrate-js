import config from "../config";
import logger from "../services/logger.service";
import loadFrameExtractor from "../services/extractors/frame";

const FRAME_EXTRACTOR = config.app.defaults.extractors.frame;

/**
 * Extract frames from a video using the specified frame extractor service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { frameExtractor: string } specifying the frame extractor service key (e.g., "ffmpeg-frame").
 *   If not provided, falls back to config.app.defaults.extractors.frame.
 * @param args.params Required parameters for frame extraction.
 * @param args.params.videoPath Path to the video file. (required)
 * @param args.params.outputDir Output directory for extracted frames. (required)
 * @param args.params.opts Service-specific options (optional).
 * @throws Error If required fields are missing: services.frameExtractor, params.videoPath, or params.outputDir.
 * @returns Extracted frame file paths.
 */
export default async function extractFramesRun({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { frameExtractor?: string };
  params: { videoPath: string; outputDir: string; opts?: any };
}): Promise<{ framePaths: string[] }> {
  const frameKey = services?.frameExtractor || FRAME_EXTRACTOR;
  if (!frameKey) {
    throw new Error(
      "services.frameExtractor is required (or set a default in config.app.defaults.extractors.frame)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { videoPath, outputDir, opts } = params;
  if (!videoPath) {
    throw new Error("params.videoPath is required");
  }
  if (!outputDir) {
    throw new Error("params.outputDir is required");
  }

  const frameExtractor = await loadFrameExtractor(frameKey);
  const { extractFrames } = frameExtractor;

  logger.log("info", "extractor/frame", id, "Extracting frames...");
  const framePaths = await extractFrames(videoPath, outputDir, opts);

  return { framePaths };
}
