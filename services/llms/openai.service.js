// services/llms/openai.service.js

const { OpenAI } = require("openai");

const config = require("../../config");

const storageService = require("../storage.service");

const APIKEY = config.openai.apiKey;
const MODEL = config.openai.model;

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

module.exports = {
  getChatResponse,
  name: "open-ai",
  model: MODEL,
};
