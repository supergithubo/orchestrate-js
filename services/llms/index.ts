// services/llms/index.ts

import { getLoaderExtension } from "../utils.service";

export default async function loadLLM(serviceKey: string): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.getResponse !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'getResponse'`);
    }
  } catch (err: any) {
    throw new Error(`LLM "${serviceKey}" failed to load: ${err.message}`);
  }
  return service;
}
