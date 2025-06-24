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

  const { prefix, ext, folder } = config.app.outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  storageService.ensureDirExists(folder);
  storageService.clearFolder(folder);

  await storageService.saveStreamToFile(stream, filePath);
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("system")} ${chalk.yellow(
        "fs-storage"
      )}: Video saved to: ${chalk.gray(filePath)}`
  );

  return { filePath, metadata };
}

async function transcribeVideo(filePath) {
  const { name } = transcriberService;

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("transcriber")} ${chalk.yellow(
        `${name}`
      )}: Transcribing audio...`
  );

  const { text, metadata } = await transcriberService.getAudioTranscription(
    filePath
  );

  const outputPath = path.join("tmp", "transcription.txt");
  await storageService.saveTextToFile(text, outputPath);

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("transcriber")} ${chalk.yellow(
        `${name}`
      )}: Audio transcribed: ${chalk.gray(
        `${metadata.textLength} chars | ${metadata.duration} seconds | ${metadata.segmentCount} segments`
      )}`
  );
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("system")} ${chalk.yellow(
        "fs-storage"
      )}: Transcription saved to: ${chalk.gray(outputPath)}`
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

  const outputPath = path.join("tmp", "analysis.txt");
  await storageService.saveTextToFile(results, outputPath);

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("vision")} ${chalk.yellow(name)}: Analysis complete.`
  );
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("system")} ${chalk.yellow(
        "fs-storage"
      )}: Analysis saved to: ${chalk.gray(outputPath)}`
  );

  return results;
}

async function generateConcept({ transcript, metadata, frameDescriptions }) {
  const { name } = llmService;

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

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("language")} ${chalk.yellow(
        `${name}`
      )}: Generating content concepts...`
  );

  return await llmService.getChatResponse(messages);
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
