const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const transcriberService = require("../services/transcribers");

module.exports = async function ({ filePath }) {
  const { name, getAudioTranscription } = transcriberService;

  logger.log("transcriber", name, "Transcribing audio...");
  const { text, metadata } = await getAudioTranscription(filePath);

  const { textLength, duration, segmentCount } = metadata;
  logger.log(
    "transcriber",
    name,
    "Audio transcribed:",
    `${textLength} chars | ${duration} seconds | ${segmentCount} segments`
  );

  const outputPath = path.join("tmp", "transcription.txt");

  logger.log("system", "fs-storage", "Saving transcription to file...");
  await storageService.saveTextToFile(text, outputPath);
  logger.log("system", "fs-storage", "Transcription saved to:", outputPath);

  return { transcription: text };
};
