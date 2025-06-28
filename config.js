require("dotenv").config();

const baseConfig = {
  app: {
    ffmpegBin: "C:\\ffmpeg\\bin\\ffmpeg.exe",
    ffprobeBin: "C:\\ffmpeg\\bin\\ffprobe.exe",
    defaults: {
      llm: "openai-response",
      vision: "openai-vision",
      generators: {
        image: "openai-image",
      },
      extractors: {
        frame: "ffmpeg-frame",
        transcription: "openai-whisper",
      },
      downloaders: {
        image: "http-download",
        video: "rapidapi-tiktok",
      },
    },
  },
};

let localConfig = {};
try {
  localConfig = require("./config.local");
} catch {}

const deepMerge = (target, source) => {
  for (const key in source) {
    if (
      typeof target[key] === "object" &&
      typeof source[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

module.exports = deepMerge(baseConfig, localConfig);
