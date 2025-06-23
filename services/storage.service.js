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

module.exports = {
  saveStreamToFile,
};
