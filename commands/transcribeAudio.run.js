// commands/transcribeAudio.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, file, opts, id }) {
  const transcriptionService = require("../services/extractors/transcription")(
    key
  );
  const { transcribe } = transcriptionService;

  logger.log("info", "extractor/transcription", id, "Transcribing audio...");
  const transcription = await transcribe(file, opts);

  return { transcription };
};
