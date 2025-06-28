# OrchestrateJS

OrchestrateJS is a **developer-first workflow automation/orchestration framework** for building powerful, flexible, and composable automations in code. It lets you define, run, and extend complex multi-step workflows that connect APIs, AI models, and custom logic—using modular, pluggable commands and services.

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

1. Downloads a TikTok video
2. Transcribes its audio and extracts frames in parallel
3. Analyzes the frames
4. Generates new content concepts

```js
[
  {
    type: "series",
    command: "generateResponse",
    params: {
      id: "openai-response-gpt-4o-mini",
      services: { llm: "openai-response" },
      params: {
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          input: "Give me a creative image prompt about the sky.",
          model: "gpt-4o-mini",
        },
      },
    },
    returnsAlias: { response: "prompt" },
  },
  {
    type: "parallel",
    commands: [
      {
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          id: "openai-image-dall-e-3",
          services: { imageGenerator: "openai-image" },
          params: {
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              prompt: context.prompt,
              model: "dall-e-3",
              size: "1024x1024",
              response_format: "url",
            },
          },
        }),
        returnsAlias: { images: "dall-e-3" },
      },
      {
        type: "series",
        command: "generateImageResponse",
        params: (context) => ({
          id: "openai-image-dall-e-2",
          services: { imageGenerator: "openai-image" },
          params: {
            opts: {
              apiKey: process.env.OPENAI_API_KEY,
              prompt: context.prompt,
              model: "dall-e-2",
              size: "1024x1024",
              response_format: "url",
            },
          },
        }),
        returnsAlias: { images: "dall-e-2" },
      },
    ],
  },
  {
    type: "series",
    command: "downloadImages",
    params: (context) => ({
      id: "http-download",
      services: { imageDownloader: "http-download" },
      params: {
        urls: [context["dall-e-3"]?.[0], context["dall-e-2"]?.[0]],
        outputDir: path.resolve(__dirname, "../../tmp"),
      },
    }),
    returns: ["imagePaths"],
  },
  {
    type: "series",
    command: "analyzeImages",
    params: (context) => ({
      id: "openai-vision-gpt-4o",
      services: {
        vision: "openai-vision",
      },
      params: {
        images: context.imagePaths,
        opts: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4o",
          messages: [
            `Compare the two images and tell me which: \n` +
              `1) One better represents this prompt:\n"${context.prompt}" \n` +
              `2) One is more realistic? \n Explain both why`,
          ],
        },
      },
    }),
    returnsAlias: { analysis: "visionAnalysis" },
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
