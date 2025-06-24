// services/extractors/ffmpeg-frame.service.js

const path = require("path");
const { exec } = require("child_process");

const config = require("../../config");
const CONFIG = config.ffmpeg;

async function extractFrames(videoPath, limit = CONFIG.frameLimit) {
  return new Promise((resolve, reject) => {
    const outputPattern = path.join(
      CONFIG.outputDir,
      `${CONFIG.filePrefix}%03d.${CONFIG.fileExt}`
    );
    const binary = CONFIG.binary || "ffmpeg";
    const command = `"${binary}" -i "${videoPath}" -vf "fps=1" -vframes ${limit} "${outputPattern}" -hide_banner -loglevel error`;

    exec(command, (err, stdout, stderr) => {
      if (err)
        return reject(new Error(`ffmpeg error: ${stderr || err.message}`));

      const frames = require("fs")
        .readdirSync(CONFIG.outputDir)
        .filter(
          (file) =>
            file.startsWith(CONFIG.filePrefix) &&
            file.endsWith(`.${CONFIG.fileExt}`)
        )
        .map((file) => path.join(CONFIG.outputDir, file));

      resolve(frames);
    });
  });
}

module.exports = {
  extractFrames,
  name: "ffmpeg-frame",
  outputDir: CONFIG.outputDir,
};
