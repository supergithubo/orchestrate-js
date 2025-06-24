// services/storage.service.js

const fs = require("fs");
const path = require("path");

function saveTextToFile(text, filePath) {
  return fs.promises.writeFile(filePath, text, "utf-8");
}

function saveStreamToFile(stream, filePath) {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

function getFileStream(filePath) {
  return fs.createReadStream(filePath);
}

async function getStreamBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

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
