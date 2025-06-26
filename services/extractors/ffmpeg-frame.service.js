// services/extractors/ffmpeg-frame.service.js

const path = require("path");
const { exec, execSync } = require("child_process");
const config = require("../../config");

const CONFIG = config.ffmpeg;
const OUTPUT_DIR = CONFIG.outputDir;
const FILE_PREFIX = CONFIG.filePrefix;
const FILE_EXT = CONFIG.fileExt;
const FRAME_LIMIT = CONFIG.frameLimit;
const FFMPEG = CONFIG.binary || "ffmpeg";
const FFPROBE = CONFIG.ffprobeBinary || "ffprobe";

/**
 * Get the duration of a video file in seconds.
 * @param {string} filePath - Path to the video file
 * @returns {number} Duration in seconds
 */
function getVideoDuration(filePath) {
  try {
    const cmd = `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const output = execSync(cmd).toString().trim();
    return parseFloat(output);
  } catch (err) {
    throw new Error(
      `Failed to get video duration using ffprobe: ${err.message}`
    );
  }
}

/**
 * Extract frames from a video file using ffmpeg.
 * @param {string} videoPath - Path to the video file
 * @param {number} [limit=FRAME_LIMIT] - Number of frames to extract
 * @returns {Promise<string[]>} Array of frame file paths
 */
async function extractFrames(videoPath, limit = FRAME_LIMIT) {
  return new Promise((resolve, reject) => {
    try {
      const duration = getVideoDuration(videoPath);
      const interval = duration / limit;
      const outputPattern = path.join(
        OUTPUT_DIR,
        `${FILE_PREFIX}%03d.${FILE_EXT}`
      );
      const vf = `fps=1/${interval.toFixed(2)}`;
      const command = `${FFMPEG} -i "${videoPath}" -vf "${vf}" -frames:v ${limit} "${outputPattern}" -hide_banner -loglevel error`;
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
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  extractFrames,
  name: "ffmpeg-frame",
  outputDir: OUTPUT_DIR,
};
