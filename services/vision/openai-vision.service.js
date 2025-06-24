// services/vision/openai-vision.service.js

const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const config = require("../../config");

const storageService = require("../storage.service");

const APIKEY = config.openaivision.apiKey;
const CHAT_MODEL = config.openaivision.model;

const openai = new OpenAI({
  apiKey: APIKEY,
});

async function analyzeFrames(frames = [], additionalContext = null) {
  const MAX_IMAGES_PER_BATCH = 5;
  const batches = [];

  for (let i = 0; i < frames.length; i += MAX_IMAGES_PER_BATCH) {
    batches.push(frames.slice(i, i + MAX_IMAGES_PER_BATCH));
  }

  const contextParts = [];
  if (additionalContext?.description) {
    contextParts.push(`Description: "${additionalContext.description}"`);
  }

  if (
    Array.isArray(additionalContext?.hashtags) &&
    additionalContext.hashtags.length
  ) {
    contextParts.push(`Hashtags: ${additionalContext.hashtags.join(", ")}`);
  }

  const promptText = [
    contextParts.length ? `Context:\n${contextParts.join("\n")}\n` : "",
    "Describe what is happening in these video frames in sequence. " +
      "Do not use numbering or labels like 'Frame 1'. " +
      "Prefix each frame's description with '~' and put each on a new line. " +
      "Do not include any other text before or after the list.",
  ].join("\n");

  const allResponses = [];
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const frameBatch = batches[batchIndex];

    const images = await Promise.all(
      frameBatch.map(async (framePath) => {
        const stream = storageService.getFileStream(framePath);
        const buffer = await storageService.getStreamBuffer(stream);
        const base64 = buffer.toString("base64");

        return {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64}`,
          },
        };
      })
    );

    const messages = [
      {
        role: "user",
        content: [{ type: "text", text: promptText }, ...images],
      },
    ];

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages,
    });

    allResponses.push(`${response.choices[0].message.content}`);
  }

  return allResponses.join("\n\n");
}

module.exports = {
  name: `open-ai-vision-${CHAT_MODEL}`,
  analyzeFrames,
};
