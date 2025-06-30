/**
 * Workflow Runner
 *
 * This module provides functions to execute a workflow composed of 'series' and 'parallel' steps.
 * Each step references a command in the 'commands/' directory and passes parameters and collects results in a shared context.
 * Used by index.ts to orchestrate the main workflow.
 */
import path from "path";

export type WorkflowStep = {
  type: "series" | "parallel";
  command?: string;
  params?: any;
  commands?: WorkflowStep[];
  returns?: string | string[];
  returnsAlias?: Record<string, string>;
};

export function checkDuplicateReturns(workflow: WorkflowStep[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  function checkSeries(step: WorkflowStep) {
    if (!step.returns) return;
    const keys = Array.isArray(step.returns) ? step.returns : [step.returns];
    for (const key of keys) {
      if (seen.has(key)) {
        duplicates.add(key);
      }
      seen.add(key);
    }
  }

  function checkParallel(step: WorkflowStep) {
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
    // eslint-disable-next-line no-console
    console.warn("\n⚠️  Duplicate return keys found in workflow:");
    duplicates.forEach((key) =>
      console.warn(` - "${key}" is returned more than once`)
    );
    console.warn("This may overwrite values in context.\n");
  }
}

async function runSeries(
  step: WorkflowStep,
  context: Record<string, any>
): Promise<any> {
  const { command, params } = step;
  const commandPath = path.join(__dirname, "commands", `${command}.run.ts`);
  let resolvedParams = typeof params === "function" ? params(context) : params;
  if (
    !resolvedParams ||
    typeof resolvedParams !== "object" ||
    !("id" in resolvedParams && "params" in resolvedParams)
  ) {
    throw new Error(
      "Command params must be in the form { id, services, params }"
    );
  }

  const commandModule = await import(commandPath);
  const commandFn = commandModule.default;
  return await commandFn(resolvedParams);
}

async function runParallel(
  step: WorkflowStep,
  context: Record<string, any>
): Promise<any[]> {
  const results = await Promise.all(
    (step.commands || []).map((subStep) => runStep(subStep, context))
  );
  return results.flat();
}

async function runStep(
  step: WorkflowStep,
  context: Record<string, any>
): Promise<any> {
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
    const keys = Array.isArray(returns) ? returns : [returns];
    for (const key of keys) {
      context[key] = result[key];
    }
  }
  return result;
}

/**
 * Runs a workflow definition, executing each step in order and collecting results in context.
 * @param workflow The workflow definition (array of steps)
 * @param initialContext Initial context to pass to the workflow
 * @returns The final context after running the workflow
 */
export async function runWorkflow(
  workflow: WorkflowStep[],
  initialContext: Record<string, any> = {}
): Promise<Record<string, any>> {
  checkDuplicateReturns(workflow);
  const context = { ...initialContext };
  for (const step of workflow) {
    await runStep(step, context);
  }
  return context;
}

export default runWorkflow;
