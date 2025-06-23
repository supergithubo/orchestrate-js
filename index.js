// index.js

const os = require("os");
const path = require("path");
const chalk = require("chalk");

const downloaderService = require("./services/downloaders");
const storageService = require("./services/storage.service");
const config = require("./config");

const ISWIN32 = os.platform() === "win32";
const timestamp = () => new Date().toISOString();
const emoji = (icon) => (ISWIN32 ? "" : icon);

const EMOJI = {
  start: emoji("📥"),
  stream: emoji("✅"),
  saved: emoji("📁"),
  error: emoji("❌"),
  done: emoji("🏁"),
};

async function downloadVideo(videoUrl) {
  console.log(
    "\n" +
      chalk.gray(`[${timestamp()}]`) +
      `${EMOJI.start} ${chalk.cyan("downloader")} ${chalk.yellow(
        downloaderService.name
      )}: Starting video download...`
  );

  const { stream, metadata } = await downloaderService.downloadVideo(videoUrl);
  console.log(
    chalk.gray(`[${timestamp()}]`) +
      `${EMOJI.stream} ${chalk.cyan("downloader")} ${chalk.yellow(
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
      `${EMOJI.saved} ${chalk.cyan("system")}: Video saved to: ${chalk.gray(
        filePath
      )}`
  );
  return filePath;
}

async function run(videoUrl) {
  try {
    const { stream, metadata } = await downloadVideo(videoUrl);
    await saveToFile(stream);
  } catch (err) {
    console.error(
      chalk.gray(`[${timestamp()}]`) +
        chalk.red(` ${EMOJI.error} Error: ${err.message}`)
    );
  }

  console.log(
    "\n" +
      chalk.gray(`[${timestamp()}]`) +
      chalk.white(`${EMOJI.done} ${chalk.cyan("system")}: Process completed.\n`)
  );
}

run("https://www.tiktok.com/@reallyweirdai/video/7514210049024118038");
