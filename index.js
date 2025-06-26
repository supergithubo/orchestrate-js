/**
 * Main Entry Point
 *
 * This file defines the workflow for processing a TikTok video, including download, transcription, frame extraction, analysis, and concept generation.
 * It loads configuration, sets up the workflow steps, and runs the workflow using the runner module.
 *
 * Usage: node index.js
 */
const config = require("./config");
const runWorkflow = require("./runner");
const logger = require("./services/logger.service");

const workflow = [
  {
    type: "series",
    command: "downloadTiktokVideo",
    params: (context) => ({
      videoUrl: context.config.app.videoUrl,
      outputFile: context.config.app.outputFile,
    }),
    returns: ["filePath", "metadata"],
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "transcribeVideo",
        params: (context) => ({
          filePath: context.filePath,
          opts: {
            saveFile: context.config.app.saveTranscription,
          },
        }),
        returns: ["transcription"],
      },
      {
        type: "series",
        command: "extractFrames",
        params: (context) => ({
          filePath: context.filePath,
        }),
        returns: ["frames"],
      },
    ],
  },
  {
    type: "series",
    command: "analyzeFrames",
    params: (context) => ({
      frames: context.frames,
      metadata: context.metadata,
      opts: {
        saveFile: context.config.app.saveAnalysis,
      },
    }),
    returns: ["frameDescriptions"],
  },
  {
    type: "series",
    command: "generateConcept",
    params: (context) => ({
      transcript: context.transcription,
      metadata: context.metadata,
      frameDescriptions: context.frameDescriptions,
    }),
    returns: ["concepts"],
  },
];

(async () => {
  try {
    logger.log("info", "Starting workflow...");
    const result = await runWorkflow(workflow, { config });
    logger.log(
      "info",
      "\n✅ Workflow completed with result:\n",
      result.concepts || result
    );
  } catch (err) {
    logger.logError("Error in workflow:", err);
  }
})();
