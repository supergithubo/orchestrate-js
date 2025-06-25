// services/logger.service.js

const chalk = require("chalk");

function log(...args) {
  const timestamp = chalk.gray(`[${new Date().toISOString()}]`);

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
      default:
        return index === 0
          ? chalk.cyan(arg)
          : index === 1
          ? chalk.yellow(arg)
          : index === 2
          ? chalk.white(arg)
          : chalk.gray(arg);
    }
  });

  console.log(`${timestamp} ${formatted.join(" ")}`);
}

function logError(error) {
  console.log(`${timestamp} Error:${chalk.red(error)}`);
}

module.exports = {
  log,
  logError
};
