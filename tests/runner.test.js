jest.mock("../services/logger.service", () => ({
  log: jest.fn(),
}));

const runWorkflow = require("../runner");
const path = require("path");

describe("runWorkflow", () => {
  it("should run a simple workflow and return context", async () => {
    // Arrange: create a dummy command file
    const dummyCommandPath = path.join(
      __dirname,
      "../commands/dummyCommand.run.js"
    );
    require("fs").writeFileSync(
      dummyCommandPath,
      "module.exports = async () => ({ result: 42 });"
    );

    const workflow = [
      {
        type: "series",
        command: "dummyCommand",
        params: () => ({}),
        returns: ["result"],
      },
    ];

    // Act
    const context = await runWorkflow(workflow, {});

    // Assert
    expect(context.result).toBe(42);

    // Cleanup
    require("fs").unlinkSync(dummyCommandPath);
  });

  it("should warn on duplicate returns in workflow", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const dummyCommandPath = path.join(
      __dirname,
      "../commands/dummyCommand.run.js"
    );
    require("fs").writeFileSync(
      dummyCommandPath,
      "module.exports = async () => ({ foo: 1, bar: 2 });"
    );
    const workflow = [
      {
        type: "series",
        command: "dummyCommand",
        params: () => ({}),
        returns: ["foo"],
      },
      {
        type: "series",
        command: "dummyCommand",
        params: () => ({}),
        returns: ["foo"],
      },
    ];
    await runWorkflow(workflow, {});
    expect(spy).toHaveBeenCalled();
    require("fs").unlinkSync(dummyCommandPath);
    spy.mockRestore();
  });

  it("should throw on unknown step type", async () => {
    await expect(
      runWorkflow([
        { type: "unknown", command: "dummyCommand", params: () => ({}) },
      ])
    ).rejects.toThrow("Unknown step type: unknown");
  });

  it("should handle a step with no returns", async () => {
    const dummyCommandPath = path.join(
      __dirname,
      "../commands/dummyNoReturn.run.js"
    );
    require("fs").writeFileSync(
      dummyCommandPath,
      "module.exports = async () => ({ foo: 1 });"
    );
    const workflow = [
      { type: "series", command: "dummyNoReturn", params: () => ({}) },
    ];
    const context = await runWorkflow(workflow, {});
    expect(context).toBeDefined();
    require("fs").unlinkSync(dummyCommandPath);
  });

  it("should handle a parallel step with empty commands array", async () => {
    const workflow = [{ type: "parallel", commands: [] }];
    const context = await runWorkflow(workflow, {});
    expect(context).toBeDefined();
  });

  it("should handle nested parallel/series steps", async () => {
    const dummyNested1Path = path.join(
      __dirname,
      "../commands/dummyNested1.run.js"
    );
    const dummyNested2Path = path.join(
      __dirname,
      "../commands/dummyNested2.run.js"
    );
    require("fs").writeFileSync(
      dummyNested1Path,
      "module.exports = async () => ({ nested: true });"
    );
    require("fs").writeFileSync(
      dummyNested2Path,
      "module.exports = async () => ({ nested2: true });"
    );
    const workflow = [
      {
        type: "parallel",
        commands: [
          {
            type: "series",
            command: "dummyNested1",
            params: () => ({}),
            returns: ["nested"],
          },
          {
            type: "parallel",
            commands: [
              {
                type: "series",
                command: "dummyNested2",
                params: () => ({}),
                returns: ["nested2"],
              },
            ],
          },
        ],
      },
    ];
    const context = await runWorkflow(workflow, {});
    expect(context.nested).toBe(true);
    expect(context.nested2).toBe(true);
    require("fs").unlinkSync(dummyNested1Path);
    require("fs").unlinkSync(dummyNested2Path);
  });
});
