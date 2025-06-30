import { OpenAI } from "openai";

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Get a response from OpenAI using the Responses API.
 *
 * @param opts Full OpenAI request payload (must include apiKey; others per API spec)
 * @param opts.apiKey OpenAI API key (required; stripped before sending)
 * @see https://platform.openai.com/docs/api-reference/responses for all valid opts fields
 *
 * @returns Promise<string> The generated response text
 * @throws Error If apiKey is missing
 */
export async function getResponse(
  opts: OpenAI.Responses.ResponseCreateParamsNonStreaming & { apiKey: string }
): Promise<string> {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload: OpenAI.Responses.ResponseCreateParamsNonStreaming = {
    ...rawPayload,
    model: rawPayload.model || DEFAULT_MODEL,
  };

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create(payload);

  if (!response.output) {
    throw new Error("No output_text returned from OpenAI Responses API");
  }

  return response.output_text;
}

export default {
  getResponse,
};
