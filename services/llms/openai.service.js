// services/llms/openai.service.js

const path = require("path");
const { File } = require("node:buffer");
const { OpenAI } = require("openai");

const config = require("../../config");

const storageService = require("../storage.service");

const APIKEY = config.openai.apiKey;
const CHAT_MODEL = config.openai.models.chat;
const TRANSCRIPTION_MODEL = config.openai.models.transcription;

if (typeof globalThis.File === "undefined") {
  globalThis.File = File;
}

const openai = new OpenAI({
  apiKey: APIKEY,
});

async function getChatResponse(messages) {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: messages,
  });
  return response.choices[0].message.content;
}

async function getAudioTranscription(filePath) {
  const stream = storageService.getFileStream(filePath);
  const response = await openai.audio.transcriptions.create({
    model: TRANSCRIPTION_MODEL,
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
  getChatResponse,
  getAudioTranscription,
  name: "openai",
  chatModel: CHAT_MODEL,
  transcriptionModel: TRANSCRIPTION_MODEL,
};
