# OrchestrateJS

OrchestrateJS is a **developer-focused workflow automation/orchestration framework** designed for maximum flexibility and power through code. It enables you to define, run, and extend complex multi-step workflows that connect APIs, AI models, and custom logic—using modular, pluggable commands and services.

## How It Works

- **Workflows** are defined as arrays of steps (series/parallel) in code (see [examples](https://github.com/supergithubo/orchestrate-js/blob/master/examples/README.md)).
- **Commands** implement each step (in `commands/`).
- **Services** provide modular integrations (APIs, AI, storage, etc.).
- **Runner** executes the workflow, passing context/results between steps.

## Project Structure

```
.
├── commands/         # Workflow step implementations (modular, pluggable)
├── services/         # Modular service implementations (API, AI, storage, etc.)
├── tmp/              # Temporary files (if needed by workflows)
├── index.js          # Example workflow definition and entry point
├── runner.js         # Workflow runner/orchestrator
├── config.js         # Global configuration
├── config.local.js   # Local overrides (gitignored)
├── .env              # Environment variables (gitignored)
├── package.json
└── tests/            # Test files (Jest)
```

## Setup

### 1. Install Node.js (Recommended: Use nvm)

#### On Linux/macOS (using [nvm](https://github.com/nvm-sh/nvm))

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart your terminal
```

#### On Windows (using [nvm-windows](https://github.com/coreybutler/nvm-windows))

- Download and run the [nvm-setup.exe](https://github.com/coreybutler/nvm-windows/releases) installer.
- After installation, open a new terminal.

> **Tip for Windows users:** For a better Unix-like experience and to run bash commands (like `nvm install`), we recommend using [Git Bash](https://gitforwindows.org/).

### 1.1 Use the Project's Node Version (`.nvmrc`)

This project includes a `.nvmrc` file specifying the recommended Node.js version.

**On Linux/macOS:**

```bash
nvm install    # Installs the version from .nvmrc
nvm use        # Uses the version from .nvmrc
```

**On Windows (nvm-windows):**

```powershell
# Check the version specified in .nvmrc
more .nvmrc
# Then run:
nvm install <version-from-.nvmrc>
nvm use <version-from-.nvmrc>
```

### 2. Clone the repository

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```env
OPENAI_API_KEY=your_openai_key
RAPIDAPI_KEY=your_rapidapi_key
```

### 5. (Optional) Configure local overrides

Copy `config.js` to `config.local.js` and adjust as needed.

### 6. Ensure ffmpeg is installed if your workflow needs it.

## Usage

Run any workflow by editing `index.js` and then:

```bash
node index.js
```

## Defining and Customizing Workflows

Workflows in OrchestrateJS are defined as arrays of steps, which can be run in series or in parallel. Each step specifies:

- `type`: `"series"` or `"parallel"`
- `command`: The command to run (for series steps)
- `commands`: An array of steps (for parallel steps)
- `params`: A function that receives the current context and returns parameters for the command
- `returns`: Which values from the command's result to add to the context

### Example Workflow

Below is an example workflow (see `index.js`) that:

1. Downloads a TikTok video
2. Transcribes its audio and extracts frames in parallel
3. Analyzes the frames
4. Generates new content concepts

```js
[
  {
    type: "series",
    command: "downloadVideos",
    params: {
      service: "rapidapi-tiktok",
      urls: [
        "https://www.tiktok.com/@aigenerationd1z/video/7489079990118599958",
      ],
      outputDir: path.resolve(__dirname, "../../tmp"),
      opts: {
        apiKey: process.env.RAPIDAPI_KEY,
      },
      name: "rapidapi-tiktok",
    },
    returns: ["videoPaths"],
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "extractFrames",
        params: (context) => ({
          service: "ffmpeg-frame",
          videoPath: context.videoPaths[0],
          outputDir: path.resolve(__dirname, "../../tmp"),
          opts: {
            frameLimit: 5,
            ffmpegBin: config.app.ffmpegBin,
            ffprobeBin: config.app.ffprobeBin,
          },
          name: "ffmpeg-frame",
        }),
        returns: ["framePaths"],
      },
      {
        type: "series",
        command: "transcribeAudio",
        params: (context) => ({
          service: "openai-whisper",
          file: context.videoPaths[0],
          opts: {
            apiKey: process.env.OPENAI_API_KEY,
            model: "whisper-1",
          },
          name: "openai-whisper",
        }),
        returns: ["transcription"],
      },
    ],
  },
  {
    type: "series",
    command: "analyzeImages",
    params: (context) => ({
      service: "openai-vision",
      images: context.framePaths,
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
        message:
          "Describe what is happening in these video frames in sequence. " +
          "Do not use numbering or labels like 'Frame 1'. " +
          "Prefix each frame's description with '~' and put each on a new line. " +
          "Do not include any other text before or after the list.",
      },
      name: "openai-vision-gpt-4o",
    }),
    returnsAlias: { analysis: "frameAnalysis" },
  },
  {
    type: "series",
    command: "generateResponse",
    params: (context) => ({
      service: "openai-completion",
      opts: {
        apiKey: process.env.OPENAI_API_KEY,
        messages: [
          {
            role: "system",
            content:
              "You are an expert content strategist for short-form videos.",
          },
          {
            role: "user",
            content:
              `Here is the transcript of a TikTok video:\n\n${context.transcription}\n\n` +
              `Visual analysis of the frames:\n${context.frameAnalysis}\n\n` +
              `Based on this, summarize the narrative and suggest 3 alternative but related concepts that could perform well.`,
          },
        ],
        model: "gpt-4o",
      },
      name: "openai-completion-gpt-4o",
    }),
    returnsAlias: { response: "suggestion" },
  },
];
```

#### How It Works

- **Series steps** run one after another, passing results to the next step.
- **Parallel steps** run multiple commands at the same time, merging their results into the context.
- The `params` function lets you dynamically build parameters using the current context (results from previous steps).
- The `returns` array / `returnsAlias` mapping specifies which keys from the command's result should be added to the context for use in later steps.

### Customizing Your Workflow

1. **Edit `index.js`**: Change, add, or remove steps to fit your use case.
2. **Add new commands**: Create a new file in `commands/` and reference it in your workflow.
3. **Use services**: Integrate new APIs or logic by adding to `services/` and using them in your commands (feel free to contribute other services—APIs, LLMs, agents, etc.—by adding them to the `services/` directory).

### Existing Services

The following services are currently available in the `services/` directory:

- **Downloaders**

  - Image
    - `http-download.service` — HTTP downloader
  - Video
    - `rapidapi-tiktok.service.js` — Download TikTok videos via RapidAPI

- **Extractors**

  - Frame
    - `ffmpeg-frame.service.js` — Extract video frames using ffmpeg
  - Transcription
    - `openai-whisper.service.js` — Audio transcription using OpenAI Whisper

- **Generators**

  - Image
    - `openai-image.service.js` — OpenAI Image generator

- **LLMs**

  - `openai-completion.service.js` — OpenAI LLM using Completion
  - `openai-response.service.js` — OpenAI LLM using Response API

- **Vision Services**

  - `openai-vision.service.js` — Frame analysis using OpenAI Vision

- **Other Core Services**:
  - `logger.service.js` — Logging utilities

### Running Your Workflow

After editing your workflow in `index.js`, run:

```bash
node index.js
```

## Testing

This project uses [Jest](https://jestjs.io/) for testing.

To run all tests:

```bash
npm test
```

To check code coverage:

```bash
npm run test:coverage
```

A detailed HTML report will be generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in your browser to view it.

Test files are located in the `tests/` directory or can be placed alongside modules using the `.test.js` suffix.

## License

MIT

---

**Contributions welcome!**
