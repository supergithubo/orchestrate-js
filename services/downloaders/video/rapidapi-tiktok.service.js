// services/downloaders/video/rapidapi-tiktok.service.js

const fs = require("fs/promises");
const fss = require("fs");
const path = require("path");
const axios = require("axios");
const { v4: uuid } = require("uuid");

/**
 * Get downloadable video URL from TikTok video URL using RapidAPI.
 *
 * @param {string} videoUrl - TikTok video URL
 * @param {string} apiKey - RapidAPI key
 * @returns {Promise<string>} Direct download URL
 */
async function getDownloadUrl(videoUrl, apiKey) {
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
 * @param {string} videoUrl - TikTok video page URL
 * @param {string} outputDir - Folder where video will be saved (required)
 * @param {object} opts - Options (must include `apiKey`)
 * @returns {Promise<string>} Path to saved video
 */
async function download(videoUrl, outputDir, opts = {}) {
  if (!/^https?:\/\//.test(videoUrl)) {
    throw new Error(`Invalid TikTok URL: ${videoUrl}`);
  }

  if (!outputDir || typeof outputDir !== "string") {
    throw new Error(`'outputDir' is required and must be a string`);
  }

  if (!opts.apiKey) {
    throw new Error(`'apiKey' is required in opts`);
  }

  const downloadUrl = await getDownloadUrl(videoUrl, opts.apiKey);

  const ext = path.extname(new URL(downloadUrl).pathname) || ".mp4";
  const filename = `video-${uuid()}${ext}`;
  const targetPath = path.join(outputDir, filename);

  await fs.mkdir(outputDir, { recursive: true });

  const writer = fss.createWriteStream(targetPath);

  const response = await axios.get(downloadUrl, { responseType: "stream" });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(targetPath));
    writer.on("error", reject);
  });
}

/**
 * Download one or more TikTok videos.
 *
 * @param {string|string[]} urls - TikTok URLs
 * @param {string} outputDir - Folder path to save videos (required)
 * @param {object} opts - Options (must include `apiKey`)
 * @returns {Promise<string[]>} Paths to saved videos
 */
async function downloadVideos(urls, outputDir, opts) {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return Promise.all(urlList.map((url) => download(url, outputDir, opts)));
}

module.exports = {
  downloadVideos,
};
