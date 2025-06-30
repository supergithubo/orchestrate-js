// services/generators/video/runway-ml.service.ts

import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import { ImageToVideoCreateParams } from '@runwayml/sdk/resources/image-to-video';
import * as fs from "fs";

const DEFAULT_MODEL = "gen4_turbo";

export async function getVideo(
  image: string,
  prompt: string,
  opts: ImageToVideoCreateParams & { apiKey: string }
): Promise<string[]> {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload: ImageToVideoCreateParams = {
    ...rawPayload,
    model: rawPayload.model || DEFAULT_MODEL,
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

  return response.output;
}

export default {
  getVideo,
};
