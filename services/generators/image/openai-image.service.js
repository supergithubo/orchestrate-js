// services/generators/image/openai-image.service.js

const { OpenAI } = require("openai");

const config = require("../../../config");

const APIKEY = config.openai.apiKey;
const MODEL = config.openai.image.model;

const openai = new OpenAI({ apiKey: APIKEY });

/**
 * Generate images from a prompt using OpenAI's image generation (responses API).
 * @param {string} prompt - The prompt to generate images for
 * @param {object} [options] - Options (tools, etc.)
 * @returns {Promise<string[]>} Array of base64 image strings
 */
async function generateImage(prompt, options = {}) {
  const tools = options.tools || [{ type: "image_generation" }];

  const response = await openai.responses.create({
    model: MODEL,
    input: prompt,
    tools,
  });

  const imageData = (response.output || [])
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  return imageData;
}

module.exports = {
  generateImage,
  name: `open-ai-${MODEL}`,
};
