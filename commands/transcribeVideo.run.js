// commands/transcribeVideo.run.js

const path = require("path");

const logger = require("../services/logger.service");
const storageService = require("../services/storage.service");
const transcriberService = require("../services/transcribers");

/**
 * Transcribes the audio from a video file using the configured transcriber service and saves the transcription if requested.
 * @param {{ filePath: string, opts?: { saveFile?: string } }} params - Video file path and options
 * @returns {Promise<{ transcription: string }>} The transcription result
 */
module.exports = async function ({ filePath, opts }) {
  const { name, getAudioTranscription } = transcriberService;

  logger.log("info", "transcriber", name, "Transcribing audio...");
  const { text: transcription, metadata } = await getAudioTranscription(
    filePath
  );

  const { textLength, duration, segmentCount } = metadata;
  logger.log(
    "info",
    "transcriber",
    name,
    "Audio transcribed:",
    `${textLength} chars | ${duration} seconds | ${segmentCount} segments`
  );

  if (opts && opts.saveFile) {
    logger.log(
      "info",
      "transcriber",
      "fs-storage",
      "Saving transcription to file..."
    );
    await storageService.saveTextToFile(transcription, opts.saveFile);
    logger.log(
      "info",
      "transcriber",
      "fs-storage",
      "Transcription saved to:",
      opts.saveFile
    );
  }

  return { transcription };
};
