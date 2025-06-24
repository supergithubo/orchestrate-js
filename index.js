// index.js

const path = require("path");
const chalk = require("chalk");

const llmService = require("./services/llms");
const downloaderService = require("./services/downloaders");
const extractorService = require("./services/extractors");
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
      )}: Video stream received`
  );
  return { stream, metadata };
}

async function saveVideoToFile(stream) {
  const { prefix, ext, folder } = config.rapidapi.tiktok.outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  storageService.ensureDirExists(folder);
  storageService.clearFolder(folder);

  await storageService.saveStreamToFile(stream, filePath);
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("system")} ${chalk.yellow(
        "storage"
      )}: Video saved to: ${chalk.gray(filePath)}`
  );
  return filePath;
}

async function transcribeVideo(filePath) {
  const { name, transcriptionModel } = llmService;

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("llm")} ${chalk.yellow(
        `${name} ${transcriptionModel}`
      )}: transcribing audio...`
  );

  return await llmService.getAudioTranscription(filePath);
}

async function extractFrames(filePath) {
  const { name, outputDir } = extractorService;

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("extractor")} ${chalk.yellow(name)}: extracting frames...`
  );

  storageService.ensureDirExists(outputDir);
  storageService.clearFolder(outputDir);

  const frames = await extractorService.extractFrames(filePath);

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("extractor")} ${chalk.yellow(name)}: extracted ${
        frames.length
      } frames`
  );

  return frames;
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
    console.log(transcription);
    /**
    const concepts = await generateConcept({ transcription, metadata });

    console.log(
      chalk.gray(`[${timestamp()}]`) +
        chalk.green(` ✅ Concept generated:\n\n${concepts}\n`)
    ); */
  } catch (err) {
    console.error(
      chalk.gray(`[${timestamp()}]`) + chalk.red(` Error: ${err.message}`)
    );
  }

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      chalk.white(
        ` ${chalk.cyan("system")} ${chalk.yellow("core")}: Process completed.\n`
      )
  );
}

run(config.app.videoUrl);
