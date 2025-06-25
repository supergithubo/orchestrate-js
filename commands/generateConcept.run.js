const logger = require("../services/logger.service");
const llmService = require("../services/llms");

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

  logger.log("language", name, "Generating content concepts...");
  const concepts = await getChatResponse(messages);

  return { concepts };
};
