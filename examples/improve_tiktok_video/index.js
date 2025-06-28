const path = require("path");
require("dotenv").config();

const runWorkflow = require("../../runner");
const logger = require("../../services/logger.service");

const workflow = [
  {
    type: "series",
    command: "downloadVideos",
    params: {
      service: "rapidapi-tiktok",
      urls: ["https://www.tiktok.com/@asmraiworks/video/7517745929076657438"],
      outputDir: path.resolve(__dirname, "../../tmp"),
      opts: {
        apiKey: process.env.RAPIDAPI_KEY,
      },
      name: "rapidapi-tiktok",
    },
    returns: ["videoPaths"],
  },
  {
    type: "series",
    command: "extractFrames",
    params: (context) => ({
      service: "ffmpeg-frame",
      videoPath: context.videoPaths[0],
      outputDir: path.resolve(__dirname, "../../tmp"),
      opts: {
        frameLimit: 10,
        ffmpegBin: "C:\\ffmpeg\\bin\\ffmpeg.exe",
        ffprobeBin: "C:\\ffmpeg\\bin\\ffprobe.exe",
      },
      name: "ffmpeg-frame",
    }),
    returns: ["framePaths"],
  },
];

(async () => {
  try {
    logger.log("info", "Starting workflow...");
    const result = await runWorkflow(workflow, {});
    console.log(result);
  } catch (err) {
    logger.logError(err, "Error in workflow:");
  }
})();
