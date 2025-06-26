// services/storage.service.js

const fs = require("fs");
const path = require("path");

/**
 * Save text to a file.
 * @param {string} text - Text to save
 * @param {string} filePath - Path to the file
 * @returns {Promise<void>}
 */
function saveTextToFile(text, filePath) {
  return fs.promises.writeFile(filePath, text, "utf-8");
}

/**
 * Save a stream to a file.
 * @param {NodeJS.ReadableStream} stream - Stream to save
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} Resolves with the file path
 */
function saveStreamToFile(stream, filePath) {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

/**
 * Get a readable file stream.
 * @param {string} filePath - Path to the file
 * @returns {fs.ReadStream}
 */
function getFileStream(filePath) {
  return fs.createReadStream(filePath);
}

/**
 * Get a buffer from a stream.
 * @param {NodeJS.ReadableStream} stream - Stream to buffer
 * @returns {Promise<Buffer>}
 */
async function getStreamBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Ensure a directory exists, creating it if necessary.
 * @param {string} dirPath - Directory path
 */
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Clear all files and folders in a directory.
 * @param {string} dirPath - Directory path
 */
function clearFolder(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  fs.readdirSync(dirPath).forEach((entry) => {
    const entryPath = path.join(dirPath, entry);
    const stat = fs.statSync(entryPath);

    if (stat.isDirectory()) {
      fs.rmSync(entryPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(entryPath);
    }
  });
}

module.exports = {
  saveTextToFile,
  saveStreamToFile,
  getFileStream,
  getStreamBuffer,
  ensureDirExists,
  clearFolder,
};
