// services/downloaders/image/http-download.service.js

const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");
const { v4: uuid } = require("uuid");

/**
 * Internal function to download a single remote image to a file.
 *
 * @param {string} url - Image URL
 * @param {string} outputDir - Folder where image will be saved (required)
 * @returns {Promise<string>} Path to saved image
 */
async function download(url, outputDir) {
  if (!/^https?:\/\//.test(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!outputDir || typeof outputDir !== "string") {
    throw new Error(`'outputDir' is required and must be a string`);
  }

  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });

    const ext = res.headers["content-type"]?.split("/")[1] || "png";
    const filename = `image-${uuid()}.${ext}`;

    await fs.mkdir(outputDir, { recursive: true });

    const targetPath = path.join(outputDir, filename);
    await fs.writeFile(targetPath, res.data);

    return targetPath;
  } catch (err) {
    throw new Error(`Failed to download image from ${url}: ${err.message}`);
  }
}

/**
 * Downloads one or more remote images to a folder.
 *
 * @param {string|string[]} urls - URL or array of image URLs
 * @param {string} outputDir - Output folder path (required)
 * @returns {Promise<string[]>} Array of paths to saved images
 */
async function downloadImages(urls, outputDir) {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return Promise.all(urlList.map((url) => download(url, outputDir)));
}

module.exports = {
  downloadImages,
};
