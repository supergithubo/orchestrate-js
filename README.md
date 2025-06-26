# OrchestrateJS

OrchestrateJS is a **developer-focused workflow automation/orchestration framework** inspired by tools like [n8n](https://n8n.io/), but designed for maximum flexibility and power through code. It enables you to define, run, and extend complex multi-step workflows that connect APIs, AI models, and custom logic—using modular, pluggable commands and services.

## How It Works

- **Workflows** are defined as arrays of steps (series/parallel) in code (see `index.js`).
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

## Customization & Extending

- **Add new commands:** Place in `commands/` and reference in your workflow.
- **Add new services:** Place in `services/` and configure in `config.js`.
- **Change workflow:** Edit `index.js` to define your own steps, triggers, and logic.

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
