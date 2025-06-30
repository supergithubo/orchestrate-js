import chalk from "chalk";

/**
 * Logs a message with timestamp, level, and formatted arguments.
 * @param level Log level (info, warn, error, debug, etc.)
 * @param args Arguments to log
 */
export function log(level: string, ...args: any[]): void {
  const timestamp = chalk.gray(`[${new Date().toISOString()}]`);
  let levelTag: string;
  switch (level) {
    case "info":
      levelTag = chalk.cyan("INFO");
      break;
    case "warn":
      levelTag = chalk.yellow("WARN");
      break;
    case "error":
      levelTag = chalk.red("ERROR");
      break;
    case "debug":
      levelTag = chalk.magenta("DEBUG");
      break;
    default:
      levelTag = chalk.white(level.toUpperCase());
  }
  const formatted = args.map((arg, index) => {
    switch (args.length) {
      case 1:
        return chalk.white(arg);
      case 2:
        return index === 0 ? chalk.cyan(arg) : chalk.white(arg);
      case 3:
        return index === 0
          ? chalk.cyan(arg)
          : index === 1
          ? chalk.yellow(arg)
          : chalk.white(arg);
      case 4:
        return index === 0
          ? chalk.cyan(arg)
          : index === 1
          ? chalk.yellow(arg)
          : index === 2
          ? chalk.white(arg)
          : chalk.gray(arg);
      default:
        return index === 0
          ? chalk.gray(arg)
          : index === 1
          ? chalk.white(arg)
          : index === 2
          ? chalk.gray(arg)
          : index === 3
          ? chalk.white(arg)
          : chalk.gray(arg);
    }
  });
  console.log(`${timestamp} [${levelTag}] ${formatted.join(" ")}`);
}

/**
 * Logs an error with stack trace if available.
 * @param error Error object or message
 * @param context Additional context
 */
export function logError(error: Error | string, ...context: any[]): void {
  const timestamp = chalk.gray(`[${new Date().toISOString()}]`);
  console.log(error);
  let message = error instanceof Error ? error.stack || error.message : error;
  if (context.length) {
    message +=
      "\nContext: " + context.map((c) => JSON.stringify(c, null, 2)).join(" ");
  }
  console.error(`${timestamp} [${chalk.red("ERROR")}] ${message}`);
}

export default {
  log,
  logError,
};
