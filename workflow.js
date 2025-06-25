module.exports = [
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
