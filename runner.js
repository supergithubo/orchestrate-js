const path = require("path");

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
  const { command, params, returns } = step;
  const commandPath = path.join(__dirname, "commands", `${command}.run.js`);
  const commandFn = require(commandPath);
  const resolvedParams =
    typeof params === "function" ? params(context) : params;

  const result = await commandFn(resolvedParams);

  if (returns) {
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

async function runParallel(step, context) {
  const results = await Promise.all(
    step.commands.map((subStep) => runStep(subStep, context))
  );

  results.forEach((res) => {
    if (res && typeof res === "object") {
      Object.entries(res).forEach(([key, value]) => {
        context[key] = value;
      });
    }
  });

  return results;
}

async function runStep(step, context) {
  if (step.type === "series") {
    return await runSeries(step, context);
  } else if (step.type === "parallel") {
    return await runParallel(step, context);
  } else {
    throw new Error(`Unknown step type: ${step.type}`);
  }
}

async function runWorkflow(workflow, initialContext = {}) {
  checkDuplicateReturns(workflow);

  const context = { ...initialContext };

  for (const step of workflow) {
    await runStep(step, context);
  }

  return context;
}

module.exports = runWorkflow;
