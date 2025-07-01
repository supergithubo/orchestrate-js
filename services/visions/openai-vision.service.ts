import { OpenAI } from "openai";
import * as fs from "fs";

const DEFAULT_MODEL = "gpt-4o";

/**
 * Describe images using OpenAI vision via chat completion.
 *
 * @param images Array of image paths(required)
 *
 * @param opts Full OpenAI request payload (must include apiKey; others per API spec)
 * @param opts.apiKey OpenAI API key (required; stripped before sending)
 * @param opts.model OpenAI model (e.g., gpt-4o) (defaults to gpt-4o)
 * @param opts.messages Message to prepend (instructions) before image content (required)
 * @see https://platform.openai.com/docs/api-reference/images for all valid `opts` fields
 *
 * @returns Promise<string[]> Array of description results
 * @throws Error If required parameters are missing
 */
export async function describeImages(
  images: string[],
  opts: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & { apiKey: string }
): Promise<string[]> {
  if (!opts.apiKey) throw new Error("'apiKey' is required");
  if (!images || !images.length) throw new Error("'images' is required");
  if (!opts.messages) throw new Error("'messages' is required");

  const { apiKey, ...rawPayload } = opts;
  const payload: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    ...rawPayload,
    model: rawPayload.model || DEFAULT_MODEL,
  };

  const client = new OpenAI({ apiKey });

  const batches = [];
  for (let i = 0; i < images.length; i += 10) {
    batches.push(images.slice(i, i + 10));
  }

  const results: string[] = [];

  for (const batch of batches) {
    const baseMessages = opts.messages.slice(0, -1);
    const lastMessage = { ...opts.messages[opts.messages.length - 1] };

    let promptText = "";
    if (typeof lastMessage.content === "string") {
      promptText = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      const textPart = lastMessage.content.find(
        (part: any): part is { type: "text"; text: string } =>
          part &&
          typeof part === "object" &&
          part.type === "text" &&
          typeof part.text === "string"
      );
      promptText = textPart?.text || "";
    } else if (
      lastMessage.content &&
      typeof lastMessage.content === "object" &&
      (lastMessage.content as any).type === "text" &&
      typeof (lastMessage.content as any).text === "string"
    ) {
      promptText = (lastMessage.content as any).text;
    }

    type ChatCompletionContentPartText = { type: "text"; text: string };
    type ChatCompletionContentPartImage = {
      type: "image_url";
      image_url: { url: string };
    };
    const imageParts: ChatCompletionContentPartImage[] = batch.map((img) => ({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${fs
          .readFileSync(img)
          .toString("base64")}`,
      },
    }));
    const contentParts: (
      | ChatCompletionContentPartText
      | ChatCompletionContentPartImage
    )[] = [{ type: "text", text: promptText }, ...imageParts];

    lastMessage.content = contentParts;

    const messages = [...baseMessages, lastMessage];
    const response = await client.chat.completions.create({
      ...payload,
      messages,
    });

    const content = response.choices?.[0]?.message?.content;
    if (content) results.push(content);
  }

  return results;
}

export default {
  describeImages,
};
