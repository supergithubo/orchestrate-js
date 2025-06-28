// services/extractors/frame/ffmpeg-frame.service.js

const path = require("path");
const fs = require("fs/promises");
const { exec, execSync } = require("child_process");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");

/**
 * Get video duration in seconds using ffprobe.
 *
 * @param {string} filePath - Path to video file
 * @param {object} opts - Options (can include `ffprobeBin`)
 * @returns {number} Duration in seconds
 */
function getVideoDuration(filePath, opts = {}) {
  const cmd = `${
    opts.ffprobeBin || "ffprobe"
  } -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
  const output = execSync(cmd).toString().trim();
  return parseFloat(output);
}

/**
 * Get video FPS using ffprobe.
 *
 * @param {string} filePath
 * @param {object} opts
 * @returns {number}
 */
function getVideoFPS(filePath, opts = {}) {
  const cmd = `${
    opts.ffprobeBin || "ffprobe"
  } -v 0 -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "${filePath}"`;
  const output = execSync(cmd).toString().trim();
  const [num, den] = output.split("/").map(Number);
  return den ? num / den : parseFloat(output);
}

/**
 * Extract N frames from video using ffmpeg.
 *
 * @param {string} videoPath - Path to video file
 * @param {string} outputDir - Base directory to save a unique subfolder of frames
 * @param {object} opts - Options (must include `frameLimit`; can include `ffmpegBin`, `ffprobeBin`, `cache`).
 * @returns {Promise<string[]>} Array of full paths to generated frames
 */
async function extractFrames(videoPath, outputDir, opts = {}) {
  if (!opts.frameLimit || typeof opts.frameLimit !== "number") {
    throw new Error(`'frameLimit' must be a number in opts`);
  }

  let cacheDir;
  let cacheFiles = [];
  if (opts.cache === true) {
    const absPath = path.resolve(videoPath);
    const hash = crypto
      .createHash("sha1")
      .update(absPath)
      .update(String(opts.frameLimit))
      .digest("hex");
    cacheDir = path.join(outputDir, `frames_${hash}`);

    const exists = await fs
      .access(cacheDir)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      cacheFiles = await fs.readdir(cacheDir);
      if (cacheFiles.length === opts.frameLimit) {
        return cacheFiles.map((f) => path.join(cacheDir, f));
      }
    }
  }

  const uniqueDir = cacheDir || path.join(outputDir, `frames_${uuid()}`);
  await fs.mkdir(uniqueDir, { recursive: true });

  const duration = getVideoDuration(videoPath, opts);
  const fps = getVideoFPS(videoPath, opts);
  const totalFrames = Math.floor(duration * fps);

  if (opts.frameLimit > totalFrames) {
    throw new Error(
      `Requested frameLimit (${opts.frameLimit}) exceeds total possible frames (${totalFrames}) from this video.`
    );
  }

  const interval = duration / opts.frameLimit;
  const outputPattern = path.join(uniqueDir, `frame_%03d.png`);
  const vf = `fps=1/${interval.toFixed(4)}`;
  const ffmpeg = opts.ffmpegBin || "ffmpeg";

  const command = `${ffmpeg} -i "${videoPath}" -vf "${vf}" -frames:v ${opts.frameLimit} "${outputPattern}" -hide_banner -loglevel error`;

  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) return reject(new Error(`ffmpeg error: ${err.message}`));

      fs.readdir(uniqueDir)
        .then((files) => files.map((f) => path.join(uniqueDir, f)))
        .then(resolve)
        .catch(reject);
    });
  });
}

module.exports = {
  extractFrames,
};
