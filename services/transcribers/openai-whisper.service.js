// services/llms/openai.service.js

const { File } = require("node:buffer");
const { OpenAI } = require("openai");

const config = require("../../config");

const storageService = require("../storage.service");

const APIKEY = config.openaiwhisper.apiKey;
const MODEL = config.openaiwhisper.model;

if (typeof globalThis.File === "undefined") {
  globalThis.File = File;
}

const openai = new OpenAI({
  apiKey: APIKEY,
});

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
  name: "open-ai",
  model: MODEL,
};
