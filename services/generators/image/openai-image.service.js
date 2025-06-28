// services/generators/image/openai-image.service.js

const { OpenAI } = require("openai");
const utils = require("../../utils.service");

const DEFAULT_MODEL = "dall-e-3";

/**
 * Generate image(s) using OpenAI's image generation API.
 *
 * @param {object} opts - Image generation options (must include `apiKey` and `prompt`)
 * @param {string} opts.apiKey - OpenAI API key (required; will be stripped before sending)
 * @param {string} opts.prompt - The prompt for the image (required)
 * @see https://platform.openai.com/docs/api-reference/images/create for all valid `opts` fields
 *
 * @returns {Promise<string[]>} Array of image URLs or base64 strings (based on `response_format`)
 * @throws {Error} If required parameters are missing
 */
async function getImageResponse(opts = {}) {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);
  if (!opts.prompt) throw new Error(`'prompt' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload = {
    ...utils.filterUndefined(rawPayload),
    model: rawPayload.model || DEFAULT_MODEL,
  };

  const client = new OpenAI({ apiKey });
  const response = await client.images.generate(payload);

  return response.data.map((img) => {
    if (payload.response_format === "b64_json") {
      if (!img.b64_json) throw new Error("Missing b64_json in image response");
      return img.b64_json;
    } else {
      if (!img.url) throw new Error("Missing url in image response");
      return img.url;
    }
  });
}

module.exports = {
  getImageResponse,
};
