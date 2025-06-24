require("dotenv").config();

const baseConfig = {
  app: {
    downloader: "rapidapi-tiktok",
    llm: "openai",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    models: {
      chat: "gpt-4o",
      transcription: "whisper-1",
    },
  },
  rapidapi: {
    tiktok: {
      apiKey: process.env.RAPIDAPI_KEY,
      host: "tiktok-video-downloader-api.p.rapidapi.com",
      url: "https://tiktok-video-downloader-api.p.rapidapi.com/media",
      outputFile: {
        prefix: "tiktok_video_",
        ext: "mp4",
        folder: "tmp",
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
