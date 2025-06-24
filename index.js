// index.js

const path = require("path");
const chalk = require("chalk");

const llmService = require("./services/llms");
const downloaderService = require("./services/downloaders");
const extractorService = require("./services/extractors");
const visionService = require("./services/vision");
const transcriberService = require("./services/transcribers");
const storageService = require("./services/storage.service");
const config = require("./config");

const timestamp = () => new Date().toISOString();

// steps

async function downloadVideo(videoUrl) {
  console.log(
    "\n" +
      chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("downloader")} ${chalk.yellow(
        downloaderService.name
      )}: Starting video download: ${chalk.gray(videoUrl)}`
  );

  const { stream, metadata } = await downloaderService.downloadVideo(videoUrl);
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("downloader")} ${chalk.yellow(
        downloaderService.name
      )}: Video stream received!`
  );
  return { stream, metadata };
}

async function saveVideoToFile(stream) {
  const { prefix, ext, folder } = config.rapidapi.tiktok.outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const outputFile = path.join(folder, filename);

  storageService.ensureDirExists(folder);
  storageService.clearFolder(folder);

  await storageService.saveStreamToFile(stream, outputFile);
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("system")} ${chalk.yellow(
        "fs-storage"
      )}: Video saved to: ${chalk.gray(outputFile)}`
  );
  return outputFile;
}

async function transcribeVideo(filePath) {
  const { name, model } = transcriberService;

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("transcriber")} ${chalk.yellow(
        `${name}-${model}`
      )}: Transcribing audio...`
  );

  const { text, metadata } = await transcriberService.getAudioTranscription(
    filePath
  );
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("transcriber")} ${chalk.yellow(
        `${name}-${model}`
      )}: Audio transcribed: ${chalk.gray(
        `${metadata.textLength} chars | ${metadata.duration} seconds | ${metadata.segmentCount} segments`
      )}`
  );
  return text;
}

async function extractFrames(filePath) {
  const { name, outputDir } = extractorService;

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("extractor")} ${chalk.yellow(name)}: Extracting frames...`
  );

  storageService.ensureDirExists(outputDir);
  storageService.clearFolder(outputDir);

  const frames = await extractorService.extractFrames(filePath);

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("extractor")} ${chalk.yellow(name)}: Extracted ${
        frames.length
      } frames to: ${chalk.gray(outputDir)}`
  );

  return frames;
}

async function analyzeFrames(frames, metadata) {
  const { name } = visionService;

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("vision")} ${chalk.yellow(name)}: Analyzing ${
        frames.length
      } frames...`
  );

  const results = await visionService.analyzeFrames(frames, metadata);

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("vision")} ${chalk.yellow(name)}: Analysis complete.`
  );

  return results;
}

async function generateConcept({ transcript, metadata }) {
  const { name, chatModel } = llmService;

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
        `Based on this, summarize the narrative and suggest 3 alternative but related concepts that could perform well.`,
    },
  ];

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("llm")} ${chalk.yellow(
        `${name} ${chatModel}`
      )}: generating concepts...`
  );
  return await llmService.getChatResponse(messages);
}

// main thread

async function run(videoUrl) {
  try {
    const { stream, metadata } = await downloadVideo(videoUrl);
    const filePath = await saveVideoToFile(stream);
    const [transcription, frames] = await Promise.all([
      transcribeVideo(filePath),
      extractFrames(filePath),
    ]);

    const frameDescriptions = await analyzeFrames(frames, metadata);
    console.log(frameDescriptions);
    /**
    const concepts = await generateConcept({ transcription, metadata });

    console.log(
      chalk.gray(`[${timestamp()}]`) +
        chalk.green(` ✅ Concept generated:\n\n${concepts}\n`)
    ); */

    console.log(metadata);
  } catch (err) {
    console.error(
      chalk.gray(`[${timestamp()}]`) + chalk.red(` Error: ${err.message}`)
    );
  }

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      chalk.white(
        ` ${chalk.cyan("system")} ${chalk.yellow(
          "core-app"
        )}: Process completed.\n`
      )
  );
}

run(config.app.videoUrl);
