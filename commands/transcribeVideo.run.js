const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const transcriberService = require("../services/transcribers");

module.exports = async function ({ filePath, opts }) {
  const { name, getAudioTranscription } = transcriberService;

  logger.log("transcriber", name, "Transcribing audio...");
  const { text: transcription, metadata } = await getAudioTranscription(
    filePath
  );

  const { textLength, duration, segmentCount } = metadata;
  logger.log(
    "transcriber",
    name,
    "Audio transcribed:",
    `${textLength} chars | ${duration} seconds | ${segmentCount} segments`
  );

  if (opts && opts.saveFile) {
    logger.log("transcriber", "fs-storage", "Saving transcription to file...");
    await storageService.saveTextToFile(transcription, opts.saveFile);
    logger.log(
      "transcriber",
      "fs-storage",
      "Transcription saved to:",
      opts.saveFile
    );
  }

  return { transcription };
};
