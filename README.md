# OrchestrateJS

OrchestrateJS is a **developer-focused workflow automation/orchestration framework** designed for maximum flexibility and power through code. It enables you to define, run, and extend complex multi-step workflows that connect APIs, AI models, and custom logic—using modular, pluggable commands and services.

## How It Works

- **Workflows** are defined as arrays of steps (series/parallel) in code (see `index.js` as initial example).
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
├── config.js         # Main configuration
├── config.local.js   # Local overrides (gitignored)
├── .env              # Environment variables (gitignored)
├── package.json
└── tests/            # Test files (Jest)
```

## Example: TikTok Video Analysis Workflow

The included example workflow:

1. Downloads a TikTok video
2. Transcribes its audio
3. Extracts frames
4. Analyzes frames with AI
5. Generates new content concepts

But you can define **any workflow** by editing or replacing the steps in `index.js`.

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
REPLICATE_API_TOKEN=your_replicate_token
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
          opts: { saveFile: context.config.app.saveTranscription },
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
      opts: { saveFile: context.config.app.saveAnalysis },
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
]
```

#### How It Works

- **Series steps** run one after another, passing results to the next step.
- **Parallel steps** run multiple commands at the same time, merging their results into the context.
- The `params` function lets you dynamically build parameters using the current context (results from previous steps).
- The `returns` array specifies which keys from the command's result should be added to the context for use in later steps.

### Customizing Your Workflow

1. **Edit `index.js`**: Change, add, or remove steps to fit your use case.
2. **Add new commands**: Create a new file in `commands/` and reference it in your workflow.
3. **Use services**: Integrate new APIs or logic by adding to `services/` and using them in your commands (feel free to contribute other services—APIs, LLMs, agents, etc.—by adding them to the `services/` directory).
4. **Pass data**: Use the context object (config file) to pass data/results between steps.

### Existing Services

The following services are currently available in the `services/` directory:

- **Downloaders** (`services/downloaders/`):
  - `rapidapi-tiktok.service.js` — Download TikTok videos via RapidAPI

- **Transcribers** (`services/transcribers/`):
  - `openai-whisper.service.js` — Audio transcription using OpenAI Whisper

- **Extractors** (`services/extractors/`):
  - `ffmpeg-frame.service.js` — Extract video frames using ffmpeg

- **LLMs** (`services/llms/`):
  - `openai.service.js` — Chat/completion with OpenAI LLMs

- **Vision Services** (`services/visions/`):
  - `openai-vision.service.js` — Frame analysis using OpenAI Vision
  - `replicate-blip.service.js` — Frame analysis using Replicate BLIP

- **Other Core Services**:
  - `storage.service.js` — File and stream storage utilities
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
