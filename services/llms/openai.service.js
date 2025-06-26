// services/llms/openai.service.js

const { OpenAI } = require("openai");

const config = require("../../config");

const APIKEY = config.openai.apiKey;
const MODEL = config.openai.llm.model;

const openai = new OpenAI({
  apiKey: APIKEY,
});

/**
 * Get a chat response from OpenAI's LLM.
 * @param {Array<object>} messages - Array of chat messages
 * @returns {Promise<string>} The response content
 */
async function getChatResponse(messages) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: messages,
  });
  return response.choices[0].message.content;
}

module.exports = {
  getChatResponse,
  name: `open-ai-${MODEL}`,
};
