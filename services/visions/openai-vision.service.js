// services/visions/openai-vision.service.js

const fs = require("fs");
const { OpenAI } = require("openai");
const utils = require("../../utils.service");

const DEFAULT_MODEL = "gpt-4o";

/**
 * Analyze images using OpenAI vision via chat completion.
 *
 * @param {Array<string|Buffer>} images - Array of image paths or buffers (required)
 * @param {object} opts - Full OpenAI request payload (must include `apiKey`; others per API spec)
 * @param {string} opts.apiKey - OpenAI API key (required; stripped before sending)
 * @param {string} opts.model - OpenAI model (e.g., gpt-4o) (defaults to gpt-4o)
 * @param {Array<object>} opts.messages - Message to prepend (instructions) before image content (required)
 * @see https://platform.openai.com/docs/api-reference/chat/create for all valid `opts` fields
 *
 * @returns {Promise<string[]>} An array of model responses (batched if too many images)
 * @throws {Error} If required parameters are missing or invalid
 */
async function analyzeImages(images, opts = {}) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error(`'images' must be a non-empty array`);
  }

  if (!opts.apiKey) throw new Error(`'apiKey' is required`);
  if (!opts.messages) throw new Error(`'messages' is required`);

  const { apiKey, messages, ...rawPayload } = opts;
  const payload = {
    ...utils.filterUndefined(rawPayload),
    model: rawPayload.model || DEFAULT_MODEL,
  };

  const client = new OpenAI({ apiKey });

  const toImagePart = (img) => ({
    type: "image_url",
    image_url: {
      url: `data:image/jpeg;base64,${
        Buffer.isBuffer(img)
          ? img.toString("base64")
          : fs.readFileSync(img).toString("base64")
      }`,
    },
  });

  const batches = [];
  for (let i = 0; i < images.length; i += 5) {
    batches.push(images.slice(i, i + 5));
  }

  const results = [];

  for (const batch of batches) {
    const textParts = Array.isArray(messages)
      ? messages.map((m) => ({ type: "text", text: m }))
      : [{ type: "text", text: messages }];

    const messageContent = [...textParts, ...batch.map(toImagePart)];
    const response = await client.chat.completions.create({
      ...payload,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    if (content) results.push(content);
  }

  return results;
}

module.exports = {
  analyzeImages,
};
