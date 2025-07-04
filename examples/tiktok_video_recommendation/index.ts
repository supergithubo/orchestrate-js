import dotenv from "dotenv";
import path from "path";
dotenv.config();

import config from "../../config";
import type { WorkflowStep } from "../../runner";
import runWorkflow from "../../runner";
import logger from "../../services/logger.service";

const workflow: WorkflowStep[] = [
  {
    command: "downloadVideos",
    params: {
      id: "rapidapi-tiktok",
      services: { videoDownloader: "rapidapi-tiktok" },
      params: {
        urls: [
          "https://www.tiktok.com/@aigenerationd1z/video/7489079990118599958",
        ],
        outputDir: path.resolve(__dirname, "../../tmp"),
        opts: {
          apiKey: process.env.RAPIDAPI_KEY,
          cache: true,
        },
      },
    },
    returns: ["videoPaths"],
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        commands: [
          {
            command: "extractFrames",
            params: (context: any) => ({
              id: "ffmpeg-frame",
              services: { frameExtractor: "ffmpeg-frame" },
              params: {
                videoPath: context.videoPaths[0],
                outputDir: path.resolve(__dirname, "../../tmp"),
                frames: 5,
                opts: {
                  ffmpegBin: config.app.ffmpegBin,
                  ffprobeBin: config.app.ffprobeBin,
                  cache: true,
                },
              },
            }),
            returns: ["framePaths"],
          },
          {
            command: "describeImages",
            params: (context: any) => ({
              id: "openai-vision-gpt-4o",
              services: { vision: "openai-vision" },
              params: {
                images: context.framePaths,
                opts: {
                  apiKey: process.env.OPENAI_API_KEY,
                  model: "gpt-4o",
                  messages: [
                    {
                      role: "user",
                      content:
                        "You are an expert video content analyst. Analyze the video frames for content, context, and visual details.",
                    },
                  ],
                },
              },
            }),
            returnsAlias: { description: "frameAnalysis" },
          },
        ],
      },
      {
        command: "transcribeAudio",
        params: (context: any) => ({
          id: "openai-whisper",
          services: { transcriber: "openai-whisper" },
          params: {
            file: context.videoPaths[0],
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              model: "whisper-1",
            },
          },
        }),
        returns: ["transcription"],
      },
    ],
  },
  {
    type: "series",
    command: "getResponse",
    params: (context: any) => ({
      id: "llm-gpt-4o-mini",
      services: { llm: "openai-response" },
      params: {
        input: `Given the following: 
        
        Video analysis: ${JSON.stringify(context.frameAnalysis)}
        
        Transcription: ${JSON.stringify(context.transcription)}
        
        Recommend a TikTok video idea
        `,
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o-mini",
        },
      },
    }),
    returnsAlias: { response: "suggestion" },
  },
];

(async () => {
  try {
    logger.log("info", "Starting tiktok-video-recommendation workflow...");
    logger.log("info");
    const result = await runWorkflow(workflow, {});
    console.log(result);
  } catch (err: any) {
    logger.logError(err, "Error in workflow:");
  }
})();
