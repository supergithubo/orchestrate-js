const config = require("./config");
const runWorkflow = require("./runner");

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
    const result = await runWorkflow(workflow, { config });
    console.log(
      "\n✅ Workflow completed with result:\n",
      result.concepts || result
    );
  } catch (err) {
    console.error("❌ Error in workflow:", err);
  }
})();
