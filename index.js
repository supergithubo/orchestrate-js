// index.js

const path = require("path");
const chalk = require("chalk");

const llmService = require("./services/llms");
const downloaderService = require("./services/downloaders");
const extractorService = require("./services/extractors");
const visionService = require("./services/vision");
const transcriberService = require("./services/transcribers");
const storageService = require("./services/storage.service");
const logger = require("./services/logger.service");
const config = require("./config");

const timestamp = () => new Date().toISOString();

// steps

async function downloadVideo(videoUrl) {
  const { name, downloadVideo } = downloaderService;

  logger.log(`downloader`, name, `Starting video download:`, videoUrl);
  const { stream, metadata } = await downloadVideo(videoUrl);
  logger.log(`downloader`, name, `Video stream received!`);

  logger.log(`system`, `fs-storage`, `Saving video...`);
  const { prefix, ext, folder } = config.app.outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  storageService.ensureDirExists(folder);
  storageService.clearFolder(folder);
  await storageService.saveStreamToFile(stream, filePath);
  logger.log(`system`, `fs-storage`, `Video saved to:`, filePath);

  return { filePath, metadata };
}

async function transcribeVideo(filePath) {
  const { name, getAudioTranscription } = transcriberService;

  logger.log(`transcriber`, name, `Transcribing audio...`);
  const { text, metadata } = await getAudioTranscription(filePath);
  const { textLength, duration, segmentCount } = metadata;
  logger.log(
    `transcriber`,
    name,
    `Audio transcribed:`,
    `${textLength} chars | ${duration} seconds | ${segmentCount} segments`
  );

  logger.log(`system`, `fs-storage`, `Saving transcription to file...`);
  const outputPath = path.join("tmp", "transcription.txt");
  await storageService.saveTextToFile(text, outputPath);
  logger.log(`system`, `fs-storage`, `Transcription saved to:`, outputPath);

  return text;
}

async function extractFrames(filePath) {
  const { name, outputDir, extractFrames } = extractorService;

  logger.log(`extractor`, name, `Extracting frames...`);
  storageService.ensureDirExists(outputDir);
  storageService.clearFolder(outputDir);

  const frames = await extractFrames(filePath);
  logger.log(
    `extractor`,
    name,
    `Extracted ${frames.length} frames to:`,
    outputDir
  );

  return frames;
}

async function analyzeFrames(frames, metadata) {
  const { name, analyzeFrames } = visionService;

  logger.log(`vision`, name, `Analyzing ${frames.length} frames...`);
  const results = await analyzeFrames(frames, metadata);
  logger.log(`vision`, name, `Analysis complete!`);

  logger.log(`system`, `fs-storage`, `Saving analysis to file...`);
  const outputPath = path.join("tmp", "analysis.txt");
  await storageService.saveTextToFile(results, outputPath);
  logger.log(`system`, `fs-storage`, `Analysis saved to:`, outputPath);

  return results;
}

async function generateConcept({ transcript, metadata, frameDescriptions }) {
  const { name, getChatResponse } = llmService;

  const messages = [
    {
      role: "system",
      content: "You are an expert content strategist for short-form videos.",
    },
    {
      role: "user",
      content:
        `Here is the transcript of a TikTok video:\n\n${transcript}\n\n` +
        `The video is described as: "${metadata.description}"\n` +
        `Hashtags: ${metadata.hashtags.join(", ")}\n\n` +
        `Visual analysis of the frames:\n${frameDescriptions}\n\n` +
        `Based on this, summarize the narrative and suggest 3 alternative but related concepts that could perform well.`,
    },
  ];
  logger.log(`language`, name, `Generating content concepts...`);
  return await getChatResponse(messages);
}

// main thread

async function run(videoUrl) {
  try {
    const { filePath, metadata } = await downloadVideo(videoUrl);
    const [transcription, frames] = await Promise.all([
      transcribeVideo(filePath),
      extractFrames(filePath),
    ]);

    const frameDescriptions = await analyzeFrames(frames, metadata);
    const concepts = await generateConcept({
      transcription,
      metadata,
      frameDescriptions,
    });

    console.log(
      chalk.gray(`[${timestamp()}]`) +
        chalk.green(` ✅ Concept generated:\n\n${concepts}\n`)
    );
  } catch (err) {
    logger.logError(err.message);
  }

  logger.log(`system`, `core-app`, `Process completed!\n`);
}

run(config.app.videoUrl);
