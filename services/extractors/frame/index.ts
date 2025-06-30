// services/extractors/frame/index.ts

import { getLoaderExtension } from "../../utils.service";

export default async function load(
  serviceKey: string
): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.extractFrames !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'extractFrames'`);
    }
  } catch (err: any) {
    throw new Error(
      `Frame Extractor "${serviceKey}" failed to load: ${err.message}`
    );
  }
  return service;
}
