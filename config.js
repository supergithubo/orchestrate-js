require("dotenv").config();

const baseConfig = {
  app: {
    videoUrl: "https://www.tiktok.com/@asmraiworks/video/7517745929076657438",
    downloader: "rapidapi-tiktok",
    llm: "openai",
    extractor: "ffmpeg-frame",
    vision: "replicate-blip",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    models: {
      chat: "gpt-4o",
      transcription: "whisper-1",
    },
  },
  rapidapi: {
    apiKey: process.env.RAPIDAPI_KEY,
    tiktok: {
      host: "tiktok-video-downloader-api.p.rapidapi.com",
      url: "https://tiktok-video-downloader-api.p.rapidapi.com/media",
      outputFile: {
        prefix: "tiktok_video_",
        ext: "mp4",
        folder: "tmp",
      },
    },
  },
  ffmpeg: {
    binary: "C:\\ffmpeg\\bin\\ffmpeg.exe",
    frameLimit: 10,
    outputDir: "tmp\\frames",
    filePrefix: "frame_",
    fileExt: "jpg",
  },
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN,
    url: "https://api.replicate.com/v1/predictions",
    blip: {
      version:
        "2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
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
