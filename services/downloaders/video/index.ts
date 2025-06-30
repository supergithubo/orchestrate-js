// services/downloaders/video/index.ts

import { getLoaderExtension } from "../../utils.service";

export default async function loadVideoDownloader(
  serviceKey: string
): Promise<any> {
  let service: any;
  const ext = getLoaderExtension();
  try {
    const module = await import(`./${serviceKey}.service.${ext}`);
    service = module.default;
    if (typeof service.downloadVideos !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'downloadVideos'`);
    }
  } catch (err: any) {
    throw new Error(
      `Video Downloader "${serviceKey}" failed to load: ${err.message}`
    );
  }
  return service;
}
