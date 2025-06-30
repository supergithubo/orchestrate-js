// services/generators/image/openai-image.service.ts

import { OpenAI } from "openai";

const DEFAULT_MODEL = "dall-e-3";

/**
 * Generate image(s) using OpenAI's image generation API.
 *
 * @param prompt The prompt for the image (required)
 * @param opts Image generation options (must include apiKey and prompt)
 * @param opts.apiKey OpenAI API key (required; will be stripped before sending)
 * @param opts.prompt The prompt for the image (required)
 * @see https://platform.openai.com/docs/api-reference/images/create for all valid opts fields
 *
 * @returns Promise<string[]> Array of image URLs or base64 strings (based on response_format)
 * @throws Error If required parameters are missing
 */
export async function getImage(
  prompt: string,
  opts: OpenAI.Images.ImageGenerateParams & { apiKey: string }
): Promise<string[]> {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload: OpenAI.Images.ImageGenerateParams = {
    model: rawPayload.model || DEFAULT_MODEL,
    ...rawPayload,
    prompt,
  };

  const client = new OpenAI({ apiKey });
  const response = await client.images.generate(payload);

  if (!response.data) {
    throw new Error("No data returned from OpenAI image API");
  }

  return response.data.map((img: any) => {
    if (opts.response_format === "b64_json") {
      if (!img.b64_json) throw new Error("Missing b64_json in image response");
      return img.b64_json;
    } else {
      if (!img.url) throw new Error("Missing url in image response");
      return img.url;
    }
  });
}

export default {
  getImage,
};
