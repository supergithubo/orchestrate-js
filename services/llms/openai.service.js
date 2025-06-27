// services/llms/openai.service.js

const { OpenAI } = require("openai");

let model = "gpt-4o-mini";

/**
 * Get a response from OpenAI using the Responses API.
 *
 * @param {object} opts - Full OpenAI request payload (must include `apiKey`; others per API spec)
 * @param {string} opts.apiKey - OpenAI API key (required; stripped before sending)
 * @see https://platform.openai.com/docs/api-reference/responses/create for all valid `opts` fields
 *
 * @returns {Promise<string>} The generated response text
 * @throws {Error} If `apiKey` is missing
 */
async function getReponse(opts = {}) {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  opts.model = opts.model || model;
  model = opts.model;

  const { apiKey, ...rawPayload } = opts;

  const payload = Object.fromEntries(
    Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
  );

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create(payload);

  return response.output_text;
}

module.exports = {
  getReponse,
};
