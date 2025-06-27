// commands/generateConcept.run.js

const logger = require("../services/logger.service");
const llmService = require("../services/llms");

/**
 * Generates content concepts based on transcript, metadata, and frame descriptions using the configured LLM service.
 * @param {{ transcript: string, metadata: object, frameDescriptions: any }} params - Transcript, metadata, and frame descriptions
 * @returns {Promise<{ concepts: any }>} The generated content concepts
 */
module.exports = async function ({ transcript, metadata, frameDescriptions }) {
  const { name, getChatResponse } = llmService;

  const messages = [
    {
      role: "system",
      content: "You are an expert content strategist for short-form videos.",
    },
    {
      role: "user",
      content:
        `Here is the transcript of a TikTok video:\n\n${transcript}\n\n` +
        `The video is described as: "${metadata.description}"\n` +
        `Hashtags: ${metadata.hashtags.join(", ")}\n\n` +
        `Visual analysis of the frames:\n${frameDescriptions}\n\n` +
        `Based on this, summarize the narrative and suggest 3 alternative but related concepts that could perform well.`,
    },
  ];

  logger.log("info", "language", name, "Generating content concepts...");
  const concepts = await getChatResponse(messages);

  return { concepts };
};
