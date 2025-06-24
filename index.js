// index.js

const path = require("path");
const chalk = require("chalk");

const downloaderService = require("./services/downloaders");
const llmService = require("./services/llms");
const storageService = require("./services/storage.service");
const config = require("./config");

const timestamp = () => new Date().toISOString();

async function downloadVideo(videoUrl) {
  console.log(
    "\n" +
      chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("downloader")} ${chalk.yellow(
        downloaderService.name
      )}: Starting video download: ${chalk.gray(
        videoUrl
      )}`
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

async function saveToFile(stream) {
  const { prefix, ext, folder } = config.rapidapi.tiktok.outputFile;
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  await storageService.saveStreamToFile(stream, filePath);
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("system")} ${chalk.yellow("storage")}: Video saved to: ${chalk.gray(
        filePath
      )}`
  );
  return filePath;
}

async function transcribeVideo(filePath) {
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("llm")} ${chalk.yellow(`${llmService.name} ${llmService.transcriptionModel}`)}: transcribing audio...`
  );

  return await llmService.getAudioTranscription(filePath);
}

async function generateConcept({ transcript, metadata }) {
  const messages = [
    {
      role: "system",
      content: "You are an expert content strategist for short-form videos.",
    },
    {
      role: "user",
      content: `Here is the transcript of a TikTok video:\n\n${transcript}\n\n` +
               `The video is described as: "${metadata.description}"\n` +
               `Hashtags: ${metadata.hashtags.join(", ")}\n\n` +
               `Based on this, summarize the narrative and suggest 3 alternative but related concepts that could perform well.`,
    },
  ];

  console.log(
    chalk.gray(`[${timestamp()}]`) +
      ` ${chalk.cyan("llm")} ${chalk.yellow(`${llmService.name} ${llmService.chatModel}`)}: generating concepts...`
  );
  return await llmService.getChatResponse(messages);
}

async function run(videoUrl) {
  try {
    const { stream, metadata } = await downloadVideo(videoUrl);
    const filePath = await saveToFile(stream);
    const transcription = await transcribeVideo(filePath);
    const concepts = await generateConcept({transcription, metadata});

    console.log(
      chalk.gray(`[${timestamp()}]`) +
        chalk.green(` ✅ Concept generated:\n\n${concepts}\n`)
    );
  } catch (err) {
    console.error(
      chalk.gray(`[${timestamp()}]`) +
        chalk.red(` Error: ${err.message}`)
    );
  }

  console.log(
      chalk.gray(`[${timestamp()}]`) +
      chalk.white(` ${chalk.cyan("system")} ${chalk.yellow("core")}: Process completed.\n`)
  );
}

run("https://www.tiktok.com/@asmraiworks/video/7517745929076657438");
