// services/llms/openai-response.service.js

const { OpenAI } = require("openai");
const utils = require("../utils.service");

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Get a response from OpenAI using the Responses API.
 *
 * @param {object} opts - Full OpenAI request payload (must include `apiKey`; others per API spec)
 * @param {string} opts.apiKey - OpenAI API key (required; stripped before sending)
 * @see https://platform.openai.com/docs/api-reference/responses for all valid `opts` fields
 *
 * @returns {Promise<string>} The generated response text
 * @throws {Error} If `apiKey` is missing
 */
async function getResponse(opts = {}) {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload = {
    ...utils.filterUndefined(rawPayload),
    model: rawPayload.model || DEFAULT_MODEL,
  };

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create(payload);

  return response.output_text;
}

module.exports = {
  getResponse,
};
