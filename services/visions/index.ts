// services/visions/index.ts

import { getLoaderExtension } from "../utils.service";

export default async function loadVision(serviceKey: string): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.analyzeImages !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'analyzeImages'`);
    }
  } catch (err: any) {
    throw new Error(`Vision "${serviceKey}" failed to load: ${err.message}`);
  }
  return service;
}
