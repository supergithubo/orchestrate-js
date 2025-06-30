// services/generators/image/index.ts

import { getLoaderExtension } from "../../utils.service";

export default async function loadImageGenerator(
  serviceKey: string
): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.getImageResponse !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'getImageResponse'`);
    }
  } catch (err: any) {
    throw new Error(
      `Image Generator "${serviceKey}" failed to load: ${err.message}`
    );
  }
  return service;
}
