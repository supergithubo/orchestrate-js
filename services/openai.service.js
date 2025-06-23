// services/openai.service.js

const { OpenAI } = require("openai");

const config = require("../config");
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

async function getOpenAIResponse(messages, model = config.openai.defaultModel) {
  const response = await openai.chat.completions.create({ model, messages });
  return response.choices[0].message.content;
}

module.exports = {
  getOpenAIResponse,
};
