// services/downloaders/image/index.ts

import { getLoaderExtension } from "../../utils.service";

export default async function load(
  serviceKey: string
): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.downloadImages !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'downloadImages'`);
    }
  } catch (err: any) {
    throw new Error(
      `Image Downloader "${serviceKey}" failed to load: ${err.message}`
    );
  }
  return service;
}
