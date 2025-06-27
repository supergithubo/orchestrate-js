/**
 * Workflow Runner
 *
 * This module provides functions to execute a workflow composed of 'series' and 'parallel' steps.
 * Each step references a command in the 'commands/' directory and passes parameters and collects results in a shared context.
 * Used by index.js to orchestrate the main workflow.
 */
const path = require("path");

const logger = require("./services/logger.service");

function checkDuplicateReturns(workflow) {
  const seen = new Set();
  const duplicates = new Set();

  function checkSeries(step) {
    if (!step.returns) return;

    const keys = Array.isArray(step.returns) ? step.returns : [step.returns];
    for (const key of keys) {
      if (seen.has(key)) {
        duplicates.add(key);
      }
      seen.add(key);
    }
  }

  function checkParallel(step) {
    if (!Array.isArray(step.commands)) return;

    for (const subStep of step.commands) {
      if (subStep.type === "series") {
        checkSeries(subStep);
      } else if (subStep.type === "parallel") {
        checkParallel(subStep);
      }
    }
  }

  for (const step of workflow) {
    if (step.type === "series") {
      checkSeries(step);
    } else if (step.type === "parallel") {
      checkParallel(step);
    }
  }

  if (duplicates.size > 0) {
    console.warn("\n⚠️  Duplicate return keys found in workflow:");
    duplicates.forEach((key) =>
      console.warn(` - "${key}" is returned more than once`)
    );
    console.warn("This may overwrite values in context.\n");
  }
}

async function runSeries(step, context) {
  const { command, params } = step;
  const commandPath = path.join(__dirname, "commands", `${command}.run.js`);
  const commandFn = require(commandPath);
  const resolvedParams =
    typeof params === "function" ? params(context) : params;

  return await commandFn(resolvedParams);
}

async function runParallel(step, context) {
  const results = await Promise.all(
    step.commands.map((subStep) => runStep(subStep, context))
  );

  return results.flat();
}

async function runStep(step, context) {
  const { returns, returnsAlias } = step;

  let result;
  if (step.type === "series") {
    result = await runSeries(step, context);
  } else if (step.type === "parallel") {
    result = await runParallel(step, context);
  } else {
    throw new Error(`Unknown step type: ${step.type}`);
  }

  if (returnsAlias && typeof returnsAlias === "object") {
    for (const [from, to] of Object.entries(returnsAlias)) {
      context[to] = result[from];
    }
  } else if (returns) {
    if (Array.isArray(returns)) {
      returns.forEach((key, i) => {
        context[key] = result[key] ?? result[i];
      });
    } else {
      context[returns] = result;
    }
  }

  return result;
}

/**
 * Runs a workflow definition, executing each step in order and collecting results in context.
 * @param {Array<object>} workflow - The workflow definition (array of steps)
 * @param {object} [initialContext={}] - Initial context to pass to the workflow
 * @returns {Promise<object>} The final context after running the workflow
 */
async function runWorkflow(workflow, initialContext = {}) {
  checkDuplicateReturns(workflow);
  const context = { ...initialContext };
  let idx = 0;
  for (const step of workflow) {
    logger.log(
      "info",
      `workflow-${idx + 1}`,
      `type`,
      step.type,
      `command/s:`,
      step.type == "series"
        ? step.command
        : step.type == "parallel"
        ? step.commands.map((c) => c.command).join(", ")
        : `unknown`
    );
    await runStep(step, context);
    idx++;
  }
  return context;
}

module.exports = runWorkflow;
