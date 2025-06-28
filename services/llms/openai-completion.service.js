// services/llms/openai-completion.service.js

const { OpenAI } = require("openai");

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Get a response from OpenAI using the Chat Completions API.
 *
 * @param {object} opts - Full OpenAI request payload (must include `apiKey`; others per API spec)
 * @param {string} opts.apiKey - OpenAI API key (required; stripped before sending)
 * @param {string} opts.model - OpenAI model (e.g., gpt-4o) (defaults to gpt-4o)
 * @param {Array<object>} opts.messages - Message content (required)
 * @see https://platform.openai.com/docs/api-reference/chat for all valid `opts` fields
 *
 * @returns {Promise<string>} The generated response text
 * @throws {Error} If `apiKey` is missing
 */
async function getResponse(opts = {}) {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);
  if (!opts.messages) throw new Error(`'messages' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload = {
    ...Object.fromEntries(
      Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
    ),
  };
  if (!payload.model) payload.model = DEFAULT_MODEL;

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create(payload);

  return response.choices?.[0]?.message?.content ?? "";
}

module.exports = {
  getResponse,
};
