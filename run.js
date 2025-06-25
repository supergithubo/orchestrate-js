const config = require("./config");
const workflow = require("./workflow");
const runWorkflow = require("./runner");

(async () => {
  try {
    const result = await runWorkflow(workflow, { config });
    console.log(
      "\n✅ Workflow completed with result:\n",
      result.concepts || result
    );
  } catch (err) {
    console.error("❌ Error in workflow:", err);
  }
})();
