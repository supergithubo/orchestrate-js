// commands/transcribeAudio.run.js

const logger = require("../services/logger.service");

module.exports = async function ({ service: key, file, opts, name }) {
  const transcriptionService = require("../services/extractors/transcription")(
    key
  );
  const { transcribe } = transcriptionService;

  logger.log("info", "extractor/transcription", name, "Transcribing audio...");
  const transcription = await transcribe(file, opts);

  return { transcription };
};
