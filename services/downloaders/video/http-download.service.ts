// services/downloaders/video/http-download.service.ts

import axios from "axios";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

/**
 * Internal function to download a single remote video to a file.
 *
 * @param url Video URL
 * @param outputDir Folder where video will be saved (required)
 * @returns Promise<string> Path to saved video
 */
async function download(url: string, outputDir: string): Promise<string> {
  if (!/^https?:\/\//.test(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!outputDir || typeof outputDir !== "string") {
    throw new Error(`'outputDir' is required and must be a string`);
  }

  const hash = crypto.createHash("sha1").update(url).digest("hex");
  await fs.mkdir(outputDir, { recursive: true });

  let ext = "mp4";
  const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (urlMatch) {
    ext = urlMatch[1];
  }

  const possibleFiles = await fs.readdir(outputDir);
  const cached = possibleFiles.find((f) => f.startsWith(`video-${hash}`));
  if (cached) {
    return path.join(outputDir, cached);
  }

  const res = await axios.get(url, { responseType: "arraybuffer" });
  if (res.headers["content-type"]) {
    const videoType = res.headers["content-type"].split("/")[1];
    if (videoType) ext = videoType;
  }
  const filename = `video-${hash}.${ext}`;
  const targetPath = path.join(outputDir, filename);
  await fs.writeFile(targetPath, res.data);
  return targetPath;
}

/**
 * Downloads one or more remote videos to a folder.
 *
 * @param urls URL or array of video URLs
 * @param outputDir Output folder path (required)
 *
 * @returns Promise<string[]> Array of paths to saved videos
 */
async function downloadVideos(
  urls: string | string[],
  outputDir: string
): Promise<string[]> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return Promise.all(urlList.map((url) => download(url, outputDir)));
}

export default {
  downloadVideos,
};
