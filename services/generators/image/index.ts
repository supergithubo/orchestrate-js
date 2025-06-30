// services/generators/image/index.ts

import { getLoaderExtension } from "../../utils.service";

export default async function load(
  serviceKey: string
): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.getImage !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'getImage'`);
    }
  } catch (err: any) {
    throw new Error(
      `Image Generator "${serviceKey}" failed to load: ${err.message}`
    );
  }
  return service;
}
