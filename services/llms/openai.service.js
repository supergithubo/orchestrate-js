// services/llms/openai.service.js

const path = require("path");
const { File } = require("node:buffer"); 
const { OpenAI } = require("openai");

const config = require("../../config");
const CONFIG = config.openai;

const storageService = require("../storage.service");

const openai = new OpenAI({
  apiKey: CONFIG.apiKey,
});

async function getChatResponse(messages, model = CONFIG.models.chat) {
  const response = await openai.chat.completions.create({ model, messages });
  return response.choices[0].message.content;
}

async function getAudioTranscription(filePath, model = CONFIG.models.transcription) {
  const stream = storageService.getFileStream(filePath);
  const buffer = await storageService.getStreamBuffer(stream);
  const file = new File([buffer], path.basename(filePath));

  const response = await openai.audio.transcriptions.create({
    file,
    model,
  });

  return response.text;
}

module.exports = {
  getChatResponse,
  getAudioTranscription,
  name: "openai",
  chatModel: CONFIG.models.chat,
  transcriptionModel: CONFIG.models.transcription
};
