// services/llms/openai.service.js

const { File } = require("node:buffer");
const { OpenAI } = require("openai");

const config = require("../../config");

const storageService = require("../storage.service");

const APIKEY = config.openai.apiKey;
const MODEL = config.openai.models.transcription;

if (typeof globalThis.File === "undefined") {
  globalThis.File = File;
}

const openai = new OpenAI({
  apiKey: APIKEY,
});

/**
 * Get an audio transcription using OpenAI Whisper.
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<{text: string, metadata: object}>} Transcription and metadata
 */
async function getAudioTranscription(filePath) {
  const stream = storageService.getFileStream(filePath);
  const response = await openai.audio.transcriptions.create({
    model: MODEL,
    file: stream,
  });
  return {
    text: response.text,
    metadata: {
      textLength: response.text?.length ?? "n/a",
      duration:
        response.duration != null ? response.duration.toFixed(2) : "n/a",
      segmentCount: Array.isArray(response.segments)
        ? response.segments.length
        : "n/a",
    },
  };
}

module.exports = {
  getAudioTranscription,
  name: `open-ai-${MODEL}`,
};
