const runWorkflow = require("../runner");
const path = require("path");
const fs = require("fs");

describe("Workflow Runner", () => {
  let dummyCommands = [];

  beforeEach(() => {
    dummyCommands = [];
  });

  afterEach(() => {
    dummyCommands.forEach((path) => {
      try {
        fs.unlinkSync(path);
      } catch (error) {
        // Ignore errors if file doesn't exist
      }
    });
  });

  const createDummyCommand = (name, implementation) => {
    const commandPath = path.join(__dirname, "../commands/", name);
    fs.writeFileSync(commandPath, implementation);
    dummyCommands.push(commandPath);
    return commandPath;
  };

  it("should handle series step with function params", async () => {
    const dummyPath = createDummyCommand("dummySeries.run.js", 
      "module.exports = async (params) => ({ result: params.value * 2 });"
    );

    const workflow = [{
      type: "series",
      command: "dummySeries",
      params: (ctx) => ({ value: ctx.input }),
      returns: ["result"]
    }];

    const context = await runWorkflow(workflow, { input: 5 });
    expect(context.result).toBe(10);
  });

  it("should handle series step with object params", async () => {
    const dummyPath = createDummyCommand("dummySeries.run.js", 
      "module.exports = async (params) => ({ result: params.value * 2 });"
    );

    const workflow = [{
      type: "series",
      command: "dummySeries",
      params: { value: 5 },
      returns: ["result"]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.result).toBe(10);
  });

  it("should handle series step with single return", async () => {
    const dummyPath = createDummyCommand("dummySeries.run.js", 
      "module.exports = async () => ({ value: 42 });"
    );

    const workflow = [{
      type: "series",
      command: "dummySeries",
      params: () => ({}),
      returns: "value"
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.value).toBe(42);
  });

  it("should handle series step with array returns", async () => {
    const dummyPath = createDummyCommand("dummySeries.run.js", 
      "module.exports = async () => ({ a: 1, b: 2 });"
    );

    const workflow = [{
      type: "series",
      command: "dummySeries",
      params: () => ({}),
      returns: ["a", "b"]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.a).toBe(1);
    expect(context.b).toBe(2);
  });

  it("should handle series step with fallback returns", async () => {
    const dummyPath = createDummyCommand("dummySeries.run.js", 
      "module.exports = async () => ({ value: 42 });"
    );

    const workflow = [{
      type: "series",
      command: "dummySeries",
      params: () => ({}),
      returns: ["missing", "value"]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.missing).toBe(42);
  });

  it("should handle parallel step with multiple commands", async () => {
    const dummy1Path = createDummyCommand("dummy1.run.js", 
      "module.exports = async () => ({ a: 1 });"
    );
    const dummy2Path = createDummyCommand("dummy2.run.js", 
      "module.exports = async () => ({ b: 2 });"
    );

    const workflow = [{
      type: "parallel",
      commands: [
        {
          type: "series",
          command: "dummy1",
          params: () => ({}),
          returns: ["a"]
        },
        {
          type: "series",
          command: "dummy2",
          params: () => ({}),
          returns: ["b"]
        }
      ]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.a).toBe(1);
    expect(context.b).toBe(2);
  });

  it("should handle nested parallel/series steps", async () => {
    const dummy1Path = createDummyCommand("dummy1.run.js", 
      "module.exports = async () => ({ a: 1 });"
    );
    const dummy2Path = createDummyCommand("dummy2.run.js", 
      "module.exports = async () => ({ b: 2 });"
    );

    const workflow = [{
      type: "parallel",
      commands: [
        {
          type: "series",
          command: "dummy1",
          params: () => ({}),
          returns: ["a"]
        },
        {
          type: "parallel",
          commands: [
            {
              type: "series",
              command: "dummy2",
              params: () => ({}),
              returns: ["b"]
            }
          ]
        }
      ]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.a).toBe(1);
    expect(context.b).toBe(2);
  });

  it("should warn on duplicate returns in workflow", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const dummyPath = createDummyCommand("dummy.run.js", 
      "module.exports = async () => ({ foo: 1, bar: 2 });"
    );

    const workflow = [
      {
        type: "series",
        command: "dummy",
        params: () => ({}),
        returns: ["foo"]
      },
      {
        type: "series",
        command: "dummy",
        params: () => ({}),
        returns: ["foo"]
      }
    ];

    await runWorkflow(workflow, {});
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should throw on unknown step type", async () => {
    await expect(
      runWorkflow([
        { type: "unknown", command: "dummyCommand", params: () => ({}) }
      ])
    ).rejects.toThrow("Unknown step type: unknown");
  });

  it("should handle parallel step with empty commands array", async () => {
    const workflow = [{ type: "parallel", commands: [] }];
    const context = await runWorkflow(workflow, {});
    expect(context).toBeDefined();
  });

  it("should handle parallel step with mixed return types", async () => {
    const dummy1Path = createDummyCommand("dummy1.run.js", 
      "module.exports = async () => ({ a: 1 });"
    );
    const dummy2Path = createDummyCommand("dummy2.run.js", 
      "module.exports = async () => 2;"
    );

    const workflow = [{
      type: "parallel",
      commands: [
        {
          type: "series",
          command: "dummy1",
          params: () => ({}),
          returns: ["a"]
        },
        {
          type: "series",
          command: "dummy2",
          params: () => ({}),
          returns: ["b"]
        }
      ]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.a).toBe(1);
    expect(context.b).toBe(2);
  });

  it("should handle parallel step with no returns", async () => {
    const dummyPath = createDummyCommand("dummy.run.js", 
      "module.exports = async () => ({ a: 1 });"
    );

    const workflow = [{
      type: "parallel",
      commands: [
        {
          type: "series",
          command: "dummy",
          params: () => ({})
        }
      ]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context).toBeDefined();
  });

  it("should handle parallel step with primitive returns", async () => {
    const dummyPath = createDummyCommand("dummy.run.js", 
      "module.exports = async () => 42;"
    );

    const workflow = [{
      type: "parallel",
      commands: [
        {
          type: "series",
          command: "dummy",
          params: () => ({}),
          returns: ["result"]
        }
      ]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.result).toBe(42);
  });

  it("should handle series step with no params", async () => {
    const dummyPath = createDummyCommand("dummy.run.js", 
      "module.exports = async () => ({ result: 42 });"
    );

    const workflow = [{
      type: "series",
      command: "dummy",
      returns: ["result"]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.result).toBe(42);
  });

  it("should handle series step with undefined returns", async () => {
    const dummyPath = createDummyCommand("dummy.run.js", 
      "module.exports = async () => undefined;"
    );

    const workflow = [{
      type: "series",
      command: "dummy",
      params: () => ({}),
      returns: ["result"]
    }];

    const context = await runWorkflow(workflow, {});
    expect(context.result).toBeUndefined();
  });
});
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
