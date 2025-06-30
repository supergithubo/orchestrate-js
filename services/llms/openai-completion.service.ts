import { OpenAI } from "openai";

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Get a response from OpenAI using the Chat Completions API.
 *
 * @param opts Full OpenAI request payload (must include `apiKey`; others per API spec)
 * @param opts.apiKey OpenAI API key (required; stripped before sending)
 * @param opts.model OpenAI model (e.g., gpt-4o) (defaults to gpt-4o)
 * @param opts.messages Message content (required)
 * @see https://platform.openai.com/docs/api-reference/chat for all valid `opts` fields
 *
 * @returns The generated response text
 * @throws Error If `apiKey` is missing
 */
export async function getResponse(
  opts: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & { apiKey: string }
): Promise<string> {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);

  const { apiKey, ...rawPayload } = opts;
  const payload: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    ...rawPayload,
    model: rawPayload.model || DEFAULT_MODEL,
  };

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create(payload);

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI Chat Completions API");
  }

  return content;
}

export default {
  getResponse,
};
