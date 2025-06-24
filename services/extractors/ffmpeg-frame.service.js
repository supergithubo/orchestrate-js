// services/extractors/ffmpeg-frame.service.js

const path = require("path");
const { exec } = require("child_process");

const config = require("../../config");

const FRAME_LIMIT = config.ffmpeg.frameLimit;
const OUTPUT_DIR = config.ffmpeg.outputDir;
const FILE_PREFIX = config.ffmpeg.filePrefix;
const FILE_EXT = config.ffmpeg.fileExt;
const BINARY = config.ffmpeg.binary;

async function extractFrames(videoPath) {
  return new Promise((resolve, reject) => {
    const outputPattern = path.join(
      OUTPUT_DIR,
      `${FILE_PREFIX}%03d.${FILE_EXT}`
    );
    const binary = BINARY || "ffmpeg";
    const command = `"${binary}" -i "${videoPath}" -vf "fps=1" -vframes ${FRAME_LIMIT} "${outputPattern}" -hide_banner -loglevel error`;

    exec(command, (err, stdout, stderr) => {
      if (err)
        return reject(new Error(`ffmpeg error: ${stderr || err.message}`));

      const frames = require("fs")
        .readdirSync(OUTPUT_DIR)
        .filter(
          (file) =>
            file.startsWith(FILE_PREFIX) && file.endsWith(`.${FILE_EXT}`)
        )
        .map((file) => path.join(OUTPUT_DIR, file));

      resolve(frames);
    });
  });
}

module.exports = {
  extractFrames,
  name: "ffmpeg-frame",
  outputDir: OUTPUT_DIR,
};
