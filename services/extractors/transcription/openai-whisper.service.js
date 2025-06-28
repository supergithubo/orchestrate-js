// services/extractors/transcription/openai-whisper.service.js

const fs = require("fs");
const { OpenAI } = require("openai");

const DEFAULT_MODEL = "whisper-1";

/**
 * Transcribe audio using OpenAI's Whisper API.
 *
 * @param {string} filePath - Path to the audio file (required)
 * @param {object} opts - Transcription options (must include `apiKey`)
 * @param {string} opts.apiKey - OpenAI API key (required; will be stripped before sending)
 * @see https://platform.openai.com/docs/api-reference/audio/createTranscription for all valid `opts` fields
 *
 * @returns {Promise<string>} Transcription text
 * @throws {Error} If `apiKey` or `filePath` is missing
 */
async function transcribe(filePath, opts = {}) {
  if (!opts.apiKey) throw new Error(`'apiKey' is required`);
  if (!filePath) throw new Error(`'filePath' is required`);
  const fileStream = fs.createReadStream(filePath);

  const { apiKey, ...rawPayload } = opts;
  const payload = {
    ...Object.fromEntries(
      Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
    ),
    file: fileStream,
  };
  if (!payload.model) payload.model = DEFAULT_MODEL;

  const client = new OpenAI({ apiKey });
  const response = await client.audio.transcriptions.create(payload);

  return response.text || response;
}

module.exports = {
  transcribe,
};
