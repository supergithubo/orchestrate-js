// services/converters/image2video/runway-ml.service.ts

import RunwayML from "@runwayml/sdk";
import { ImageToVideoCreateParams } from "@runwayml/sdk/resources/image-to-video";
import axios from "axios";
import crypto from "crypto";
import * as fs from "fs";
import path from "path";

const DEFAULT_MODEL = "gen4_turbo";
const DEFAULT_RATIO = "960:960";
const DEFAULT_DURATION = 5;

/**
 * Generate video(s) using RunwayML's image-to-video API and download them locally.
 *
 * @param image Path to the input image file (JPEG/PNG/etc)
 * @param prompt Text prompt describing the desired video (required)
 * @param outputDir Directory where downloaded videos will be saved (required)
 * @param opts Video generation options (must include apiKey)
 * @param opts.apiKey RunwayML API key (required; will be stripped before sending)
 * @see https://docs.runwayml.com/reference/image-to-video-create for all valid opts fields
 *
 * @returns Promise<string[]> Array of local file paths to the downloaded videos
 * @throws Error If required parameters are missing or generation/download fails
 */
async function imageToVideo(
  image: string,
  prompt: string,
  outputDir: string,
  opts: ImageToVideoCreateParams & { apiKey: string }
): Promise<string[]> {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  const { apiKey, ...rawPayload } = opts;

  const payload: ImageToVideoCreateParams = {
    ...rawPayload,
    model: rawPayload.model || DEFAULT_MODEL,
    ratio: rawPayload.ratio || DEFAULT_RATIO,
    duration: rawPayload.duration || DEFAULT_DURATION,
    promptImage: `data:image/jpeg;base64,${fs
      .readFileSync(image)
      .toString("base64")}`,
    promptText: prompt,
  };

  const client = new RunwayML({ apiKey });
  const response = await client.imageToVideo
    .create(payload)
    .waitForTaskOutput();

  if (!response) {
    throw new Error("No data returned from Runway API");
  }

  if (!response.output) {
    throw new Error("No output returned from Runway API");
  }

  await fs.promises.mkdir(outputDir, { recursive: true });
  const savedPaths: string[] = [];
  for (const url of response.output) {
    const hash = crypto.createHash("sha1").update(url).digest("hex");
    let ext = "mp4";
    const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (urlMatch) {
      ext = urlMatch[1];
    }
    const filename = `video-${hash}.${ext}`;
    const targetPath = path.join(outputDir, filename);
    const res = await axios.get(url, { responseType: "arraybuffer" });

    if (res.headers["content-type"]) {
      const videoType = res.headers["content-type"].split("/")[1];
      if (videoType) ext = videoType;
    }
    await fs.promises.writeFile(targetPath, res.data);
    savedPaths.push(targetPath);
  }
  return savedPaths;
}

export default {
  imageToVideo,
};
