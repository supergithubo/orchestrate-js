// services/generators/image/openai-image.service.js

const { OpenAI } = require("openai");

const config = require("../../../config");

const APIKEY = config.openai.apiKey;
const MODEL = config.openai.image.model;

const openai = new OpenAI({ apiKey: APIKEY });

/**
 * Generate images from a prompt using OpenAI's DALL-E image generation API.
 * @param {string} prompt - The prompt to generate images for
 * @param {object} [options] - Options (e.g., size, n, style)
 * @returns {Promise<string[]>} Array of image URLs
 */
async function generateImage(prompt, options = {}) {
  const {
    n = 1,
    size = "1024x1024", // Supported: "1024x1024", "1792x1024", "1024x1792"
    style = "vivid", // "vivid" or "natural"
    quality = "standard", // "hd" or "standard"
  } = options;

  const response = await openai.images.generate({
    model: MODEL,
    prompt,
    n,
    size,
    style,
    quality,
  });

  const imageUrls = (response.data || []).map((img) => img.url);
  return imageUrls;
}

module.exports = {
  generateImage,
  name: `openai-${MODEL}`,
};
