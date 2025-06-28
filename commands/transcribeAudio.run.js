// commands/transcribeAudio.run.js

const config = require("../config");
const logger = require("../services/logger.service");

const TRANSCRIBER = config.app.defaults.extractors.transcription;

/**
 * Transcribe audio using the specified transcriber service.
 *
 * @param {Object} args
 * @param {string} args.id - Unique identifier for this command invocation (logging/tracing).
 * @param {Object} args.services - Must include { transcriber: string } specifying the transcriber service key (e.g., "openai-whisper").
 *   If not provided, falls back to config.app.defaults.extractors.transcription.
 * @param {Object} args.params - Required parameters for transcription.
 * @param {string} args.params.file - Path to the audio file to transcribe. (required)
 * @param {Object} [args.params.opts] - Service-specific options (optional).
 * @throws {Error} If required fields are missing: services.transcriber or params.file.
 * @returns {Promise<{transcription: string}>} - Transcription result.
 */
module.exports = async function ({ id, services = {}, params }) {
  const transcriberKey = services.transcriber || TRANSCRIBER;
  if (!transcriberKey) {
    throw new Error(
      "services.transcriber is required (or set a default in config.app.defaults.extractors.transcription)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { file, opts } = params;
  if (!file) {
    throw new Error("params.file is required");
  }

  const transcriber = require("../services/extractors/transcription")(
    transcriberKey
  );
  const { transcribe } = transcriber;

  logger.log("info", "transcriber", id, "Transcribing audio...");
  const transcription = await transcribe(file, opts);

  return { transcription };
};
