// services/downloaders/image/http-download.service.ts

import axios from "axios";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

/**
 * Internal function to download a single remote image to a file.
 *
 * @param url Image URL
 * @param outputDir Folder where image will be saved (required)
 * @returns Promise<string> Path to saved image
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

  let ext = "png";
  const possibleFiles = await fs.readdir(outputDir);
  const cached = possibleFiles.find((f) => f.startsWith(`image-${hash}`));
  if (cached) {
    return path.join(outputDir, cached);
  }

  const res = await axios.get(url, { responseType: "arraybuffer" });
  ext = res.headers["content-type"]?.split("/")[1] || "png";
  const filename = `image-${hash}.${ext}`;
  const targetPath = path.join(outputDir, filename);
  await fs.writeFile(targetPath, res.data);
  return targetPath;
}

/**
 * Downloads one or more remote images to a folder.
 *
 * @param urls URL or array of image URLs
 * @param outputDir Output folder path (required)
 * @returns Promise<string[]> Array of paths to saved images
 */
async function downloadImages(
  urls: string | string[],
  outputDir: string
): Promise<string[]> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return Promise.all(urlList.map((url) => download(url, outputDir)));
}

export default {
  downloadImages,
};
