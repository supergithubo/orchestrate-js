# OrchestrateJS

OrchestrateJS is a **developer-first workflow automation/orchestration framework** for building powerful, flexible, and composable automations in code. 

> **Inspired by** [n8n](https://app.n8n.cloud/), [Make.com](https://www.make.com/en), and [Zapier](https://zapier.com/workflows), OrchestrateJS brings the power and flexibility of code-first workflow automation to developers who want full control, extensibility, and composability.

Unlike visual workflow builders, OrchestrateJS lets you define, run, and extend complex multi-step workflows directly in JavaScript/TypeScript—connecting APIs, AI models, and custom logic using modular, pluggable commands and services.

## Key Features

- **Code-First Workflows:** Define workflows as arrays of steps (series/parallel) in JavaScript for maximum flexibility and composability.
- **Modular Commands:** Each step is implemented as a command in `commands/`, making it easy to add, swap, or extend capabilities.
- **Service Integrations:** Plug in APIs, AI models, or custom services via a unified interface.
- **Context-Aware Runner:** The runner executes workflows, passing results and context between steps for dynamic, data-driven automation.

## Quick Start

- Clone the repo and install dependencies (see Setup below).
- Explore the [`examples/`](./examples) folder for ready-to-run workflows:
  - **[prompt_to_model_comparison](./examples/prompt_to_model_comparison/README.md):** Automatically generate creative prompts and compare outputs from multiple AI image models.
  - **[tiktok_video_enhancer](./examples/tiktok_video_enhancer/README.md):** Analyze, transcribe, and summarize TikTok videos using AI (download, extract frames, transcribe audio, analyze, summarize).
- Use these as templates to build your own automations!

## How It Works

- **Workflows:** Defined as arrays of steps (series/parallel) in code. See [`examples/`](./examples/) for real-world patterns.
- **Commands:** Implement each step (in `commands/`).
- **Services:** Provide modular integrations (APIs, AI, storage, etc.).
- **Runner:** Executes the workflow, passing context/results between steps.

## Project Structure

```
.
├── commands/         # Workflow step implementations (modular, pluggable)
├── services/         # Modular service integrations (API, AI, storage, etc.)
├── examples/         # Example workflows
├── tmp/              # Temporary files (used by workflows)
├── index.js          # Example workflow entry point
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

- Video Download: TikTok downloader via RapidAPI or similar
- Frame Extraction: FFmpeg or equivalent
- Audio Transcription: OpenAI Whisper
- Vision Analysis: OpenAI Vision (GPT-4o)
- Text Summarization: OpenAI GPT-4o or other LLM

```js
[
  {
    type: "series",
    command: "downloadVideos",
    params: {
      id: "rapidapi-tiktok",
      services: { videoDownloader: "rapidapi-tiktok" },
      params: {
        urls: [
          "https://www.tiktok.com/@aigenerationd1z/video/7489079990118599958",
        ],
        outputDir: path.resolve(__dirname, "../../tmp"),
        opts: {
          apiKey: process.env.RAPIDAPI_KEY,
          cache: true,
        },
      },
    },
    returns: ["videoPaths"],
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "extractFrames",
        params: (context: any) => ({
          id: "ffmpeg-frame",
          services: { frameExtractor: "ffmpeg-frame" },
          params: {
            videoPath: context.videoPaths[0],
            outputDir: path.resolve(__dirname, "../../tmp"),
            frames: 5,
            opts: {
              ffmpegBin: config.app.ffmpegBin,
              ffprobeBin: config.app.ffprobeBin,
              cache: true,
            },
          },
        }),
        returns: ["framePaths"],
      },
      {
        type: "series",
        command: "transcribeAudio",
        params: (context: any) => ({
          id: "openai-whisper",
          services: { transcriber: "openai-whisper" },
          params: {
            file: context.videoPaths[0],
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              model: "whisper-1",
            },
          },
        }),
        returns: ["transcription"],
      },
    ],
  },
  {
    type: "series",
    command: "describeImages",
    params: (context: any) => ({
      id: "openai-vision-gpt-4o",
      services: { vision: "openai-vision" },
      params: {
        images: context.framePaths,
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content:
                "You are an expert video content analyst. Analyze the video frames for content, context, and visual details.",
            },
          ],
        },
      },
    }),
    returnsAlias: { description: "frameAnalysis" },
  },
  {
    type: "series",
    command: "getResponse",
    params: (context: any) => ({
      id: "llm-gpt-4o-mini",
      services: { llm: "openai-response" },
      params: {
        input: `Given the following video analysis, recommend a TikTok video idea: ${JSON.stringify(
          context.frameAnalysis
        )}`,
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o-mini",
        },
      },
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
