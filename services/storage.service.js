// services/storage.service.js

const fs = require("fs");

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

module.exports = {
  saveStreamToFile,
  getFileStream,
  getStreamBuffer
};
