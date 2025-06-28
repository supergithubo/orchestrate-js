// services/downloaders/video/rapidapi-tiktok.service.js

const fs = require("fs/promises");
const fss = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");
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
 * @param {object} opts - Options (must include `apiKey`; can include `cache`)
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

  const hash = crypto.createHash("sha1").update(videoUrl).digest("hex");
  await fs.mkdir(outputDir, { recursive: true });
  const downloadUrl = await getDownloadUrl(videoUrl, opts.apiKey);
  const ext = path.extname(new URL(downloadUrl).pathname) || ".mp4";

  let filename;
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

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on("error", (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on("close", () => {
      if (!error) {
        resolve();
      }
    });
  });

  return targetPath;
}

/**
 * Download one or more TikTok videos.
 *
 * @param {string|string[]} urls - TikTok URLs
 * @param {string} outputDir - Folder path to save videos (required)
 * @param {object} opts - Options (must include `apiKey`; can include `cache`).
 * @returns {Promise<string[]>} Paths to saved videos
 */
async function downloadVideos(urls, outputDir, opts) {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return Promise.all(urlList.map((url) => download(url, outputDir, opts)));
}

module.exports = {
  downloadVideos,
};
