import dotenv from "dotenv";
dotenv.config();

export type AppConfig = {
  app: {
    ffmpegBin: string;
    ffprobeBin: string;
    defaults: {
      llm: string;
      vision: string;
      generators: { image: string };
      extractors: { frame: string; transcription: string };
      downloaders: { image: string; video: string };
    };
  };
};

const baseConfig: AppConfig = {
  app: {
    ffmpegBin: "C:\\ffmpeg\\bin\\ffmpeg.exe",
    ffprobeBin: "C:\\ffmpeg\\bin\\ffprobe.exe",
    defaults: {
      llm: "openai-response",
      vision: "openai-vision",
      generators: { image: "openai-image" },
      extractors: { frame: "ffmpeg-frame", transcription: "openai-whisper" },
      downloaders: { image: "http-download", video: "rapidapi-tiktok" },
    },
  },
};

let localConfig: Partial<AppConfig> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  localConfig = require("./config.local").default;
} catch {}

function deepMerge<T>(target: T, source: Partial<T>): T {
  for (const key in source) {
    if (
      typeof target[key] === "object" &&
      typeof source[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      (target as any)[key] = source[key];
    }
  }
  return target;
}

const config: AppConfig = deepMerge(baseConfig, localConfig);

export default config;
