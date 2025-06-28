const path = require("path");

require("dotenv").config();

const config = require("../../config");
const runWorkflow = require("../../runner");
const logger = require("../../services/logger.service");

const workflow = [
  {
    type: "series",
    command: "downloadVideos",
    params: {
      service: "rapidapi-tiktok",
      urls: [
        "https://www.tiktok.com/@aigenerationd1z/video/7489079990118599958",
      ],
      outputDir: path.resolve(__dirname, "../../tmp"),
      opts: {
        apiKey: process.env.RAPIDAPI_KEY,
      },
      id: "rapidapi-tiktok",
    },
    returns: ["videoPaths"],
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "extractFrames",
        params: (context) => ({
          service: "ffmpeg-frame",
          videoPath: context.videoPaths[0],
          outputDir: path.resolve(__dirname, "../../tmp"),
          opts: {
            frameLimit: 5,
            ffmpegBin: config.app.ffmpegBin,
            ffprobeBin: config.app.ffprobeBin,
          },
          id: "ffmpeg-frame",
        }),
        returns: ["framePaths"],
      },
      {
        type: "series",
        command: "transcribeAudio",
        params: (context) => ({
          service: "openai-whisper",
          file: context.videoPaths[0],
          opts: {
            apiKey: process.env.OPENAI_API_KEY,
            model: "whisper-1",
          },
          id: "openai-whisper",
        }),
        returns: ["transcription"],
      },
    ],
  },
  {
    type: "series",
    command: "analyzeImages",
    params: (context) => ({
      service: "openai-vision",
      images: context.framePaths,
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
        messages: [
          "Describe what is happening in these video frames in sequence. " +
            "Do not use numbering or labels like 'Frame 1'. " +
            "Prefix each frame's description with '~' and put each on a new line. " +
            "Do not include any other text before or after the list.",
        ],
      },
      id: "openai-vision-gpt-4o",
    }),
    returnsAlias: { analysis: "frameAnalysis" },
  },
  {
    type: "series",
    command: "generateResponse",
    params: (context) => ({
      service: "openai-completion",
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        messages: [
          {
            role: "system",
            content:
              "You are an expert content strategist for short-form videos.",
          },
          {
            role: "user",
            content:
              `Here is the transcript of a TikTok video:\n\n${context.transcription}\n\n` +
              `Visual analysis of the frames:\n${context.frameAnalysis}\n\n` +
              `Based on this, summarize the narrative and suggest 3 alternative but related concepts that could perform well.`,
          },
        ],
        model: "gpt-4o",
      },
      id: "openai-completion-gpt-4o",
    }),
    returnsAlias: { response: "suggestion" },
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
