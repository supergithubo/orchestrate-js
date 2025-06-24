// services/llms/openai.service.js

const path = require("path");
const { File } = require("node:buffer");
const { OpenAI } = require("openai");

const config = require("../../config");
const CONFIG = config.openai;

const storageService = require("../storage.service");

if (typeof globalThis.File === "undefined") {
  globalThis.File = File;
}

const openai = new OpenAI({
  apiKey: CONFIG.apiKey,
});

async function getChatResponse(messages, model = CONFIG.models.chat) {
  const response = await openai.chat.completions.create({ model, messages });
  return response.choices[0].message.content;
}

async function getAudioTranscription(
  filePath,
  model = CONFIG.models.transcription
) {
  const stream = storageService.getFileStream(filePath);
  const response = await openai.audio.transcriptions.create({
    file: stream,
    model,
  });

  return response.text;
}

module.exports = {
  getChatResponse,
  getAudioTranscription,
  name: "openai",
  chatModel: CONFIG.models.chat,
  transcriptionModel: CONFIG.models.transcription,
};
