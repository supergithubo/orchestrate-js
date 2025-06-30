// services/downloaders/video/rapidapi-tiktok.service.ts

import axios from "axios";
import crypto from "crypto";
import fss from "fs";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

/**
 * Get downloadable video URL from TikTok video URL using RapidAPI.
 *
 * @param videoUrl TikTok video URL
 * @param apiKey RapidAPI key
 * @returns Promise<string> Direct download URL
 */
async function getDownloadUrl(
  videoUrl: string,
  apiKey: string
): Promise<string> {
  const options = {
    method: "GET",
    url: "https://tiktok-video-downloader-api.p.rapidapi.com/media",
    params: { videoUrl },
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "tiktok-video-downloader-api.p.rapidapi.com",
    },
  };

  const response = await axios.request(options);
  const { downloadUrl } = response.data;

  if (!downloadUrl) {
    throw new Error("Missing downloadUrl in API response");
  }

  return downloadUrl;
}

/**
 * Download a single TikTok video to a file.
 *
 * @param videoUrl TikTok video page URL
 * @param outputDir Folder where video will be saved (required)
 * @param opts Options (must include apiKey; can include cache)
 * @returns Promise<string> Path to saved video
 */
async function download(
  videoUrl: string,
  outputDir: string,
  opts: { apiKey: string; cache?: boolean; [key: string]: any } = {} as any
): Promise<string> {
  if (!/^https?:\/\//.test(videoUrl)) {
    throw new Error(`Invalid TikTok URL: ${videoUrl}`);
  }

  if (!outputDir || typeof outputDir !== "string") {
    throw new Error(`'outputDir' is required and must be a string`);
  }

  if (!opts.apiKey) {
    throw new Error(`'apiKey' is required in opts`);
  }

  const hash = crypto.createHash("sha1").update(videoUrl).digest("hex");
  await fs.mkdir(outputDir, { recursive: true });
  const downloadUrl = await getDownloadUrl(videoUrl, opts.apiKey);
  const ext = path.extname(new URL(downloadUrl).pathname) || ".mp4";

  let filename: string;
  if (opts.cache === true) {
    filename = `video_${hash}${ext}`;
    const possibleFiles = await fs.readdir(outputDir);
    const cached = possibleFiles.find((f) => f.startsWith(`video_${hash}`));
    if (cached) {
      return path.join(outputDir, cached);
    }
  } else {
    filename = `video_${uuid()}${ext}`;
  }

  const targetPath = path.join(outputDir, filename);
  const writer = fss.createWriteStream(targetPath);
  const response = await axios({
    method: "GET",
    url: downloadUrl,
    responseType: "stream",
  });

  await new Promise<void>((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return targetPath;
}

/**
 * Download one or more TikTok videos.
 *
 * @param urls TikTok URLs
 * @param outputDir Folder path to save videos (required)
 * @param opts Options (must include apiKey; can include cache).
 * @returns Promise<string[]> Paths to saved videos
 */
async function downloadVideos(
  urls: string | string[],
  outputDir: string,
  opts: { apiKey: string; cache?: boolean; [key: string]: any }
): Promise<string[]> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return Promise.all(urlList.map((url) => download(url, outputDir, opts)));
}

export default {
  downloadVideos,
};
