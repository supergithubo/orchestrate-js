import fs from "fs";
import { OpenAI } from "openai";

const DEFAULT_MODEL = "whisper-1";

/**
 * Transcribe audio using OpenAI's Whisper API.
 *
 * @param filePath Path to the audio file (required)
 * @param opts Transcription options (must include apiKey)
 * @param opts.apiKey OpenAI API key (required; will be stripped before sending)
 * @see https://platform.openai.com/docs/api-reference/audio/createTranscription for all valid opts fields
 *
 * @returns Promise<string> Transcription text
 * @throws Error If apiKey or filePath is missing
 */
export async function transcribe(
  filePath: string,
  opts: OpenAI.Audio.Transcriptions.TranscriptionCreateParamsNonStreaming & {
    apiKey: string;
  }
): Promise<string> {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);
  if (!filePath) throw new Error(`'filePath' is required`);
  const fileStream = fs.createReadStream(filePath);

  const { apiKey, ...rawPayload } = opts;
  const payload = {
    ...rawPayload,
    model: rawPayload.model || DEFAULT_MODEL,
    file: fileStream,
  };

  const client = new OpenAI({ apiKey });
  const response = await client.audio.transcriptions.create(payload);

  if (!response.text) {
    throw new Error("No transcription text returned from OpenAI Whisper API");
  }

  return response.text;
}

export default {
  transcribe,
};
