import config from "../config";
import logger from "../services/logger.service";
import loadTranscriber from "../services/extractors/transcription";

const TRANSCRIBER = config.app.defaults.extractors.transcription;

/**
 * Transcribe audio using the specified transcriber service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { transcriber: string } specifying the transcriber service key (e.g., "openai-whisper").
 *   If not provided, falls back to config.app.defaults.extractors.transcription.
 * @param args.params Required parameters for transcription.
 * @param args.params.file Path to the audio file to transcribe. (required)
 * @param args.params.opts Service-specific options (optional).
 * @throws Error If required fields are missing: services.transcriber or params.file.
 * @returns Transcription result.
 */
export default async function transcribeAudioRun({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { transcriber?: string };
  params: { file: string; opts?: any };
}): Promise<{ transcription: string }> {
  const transcriberKey = services?.transcriber || TRANSCRIBER;
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

  const transcriber = await loadTranscriber(transcriberKey);
  const { transcribe } = transcriber;

  logger.log("info", "transcriber", id, "Transcribing audio...");
  const transcription = await transcribe(file, opts);

  return { transcription };
}
