import config from "../config";
import logger from "../services/logger.service";
import load from "../services/llms";

const LLM = config.app.defaults.llm;

/**
 * Generate a language model response using the specified LLM service.
 *
 * @param args
 * @param args.id Unique identifier for this command invocation (logging/tracing).
 * @param args.services Must include { llm: string } specifying the LLM service key (e.g., "openai-response").
 *   If not provided, falls back to config.app.defaults.llm.
 * @param args.params Required parameters for LLM response.
 * @param args.params.input The input to the LLM (string or array of objects).
 * @param args.params.opts Options for the LLM service. (required)
 * 
 * @throws Error If required fields are missing: services.llm or params.opts.
 * @returns LLM response result.
 */
export default async function run({
  id,
  services = {},
  params,
}: {
  id: string;
  services?: { llm?: string };
  params: { input: string | Array<any>, opts: any };
}): Promise<{ response: any }> {
  const llmKey = services?.llm || LLM;
  if (!llmKey) {
    throw new Error(
      "services.llm is required (or set a default in config.app.defaults.llm)"
    );
  }

  if (!params || typeof params !== "object") {
    throw new Error("params object is required");
  }
  const { input, opts } = params;
  if (!input) {
    throw new Error("params.input is required");
  }
  if (!opts) {
    throw new Error("params.opts is required");
  }

  const llm = await load(llmKey);
  const { getResponse } = llm;

  logger.log("info", "llm", id, "Generating response...");
  const response = await getResponse(input, opts);

  return { response };
}
